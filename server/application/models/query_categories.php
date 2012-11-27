<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
Class Query_categories extends CI_Model {
    
    function respond_query() {
        
        $query = $this -> db -> query("SELECT id, name_et as name, color FROM categories");
        $cat = '';
        if ($query->num_rows() > 0) {
            $query_respons_p = $query->result();
            foreach($query_respons_p as $row) {
                $cat .= '<li><div class="catcolor" style="background-color: '.
                        $row->color.';"></div> - '.$row->name.
                        '<input type="checkbox" class="catSelect" value="'.$row->id.'" checked="checked" />';
            }
        }
        $categories_html = '<ul>'.$cat.'</ul>';
        echo $categories_html;
    }
    function respond_query_name($region_id = 1) {
        $query = $this -> db -> query("SELECT id, name_et, name_en, name_ru FROM categories WHERE region_id=".$region_id." ORDER BY id");
        
        return $query->result();
    }
    function respond_query_id($region_id = 1) {
        $query = $this -> db -> query("SELECT id FROM categories WHERE region_id=".$region_id);      
        return $query->result();
    }
    
    function getLastCategorysRevision($region_id) {
        $query = $this -> db -> query("SELECT max(id) as maxId FROM category_revisions WHERE region_id=".$region_id);        
        return $query->row();
    }
    function getCategories($sql) {
        $query_primary = $this -> db -> query($sql);
        if ($query_primary->num_rows() > 0) {
            $query_respons_p = $query_primary->result();
            $primary_categorys = array();
            
            foreach($query_respons_p as $row) {
               $query_secondary = $this -> db -> query("SELECT name_et as name ,id_sub FROM sub_categories WHERE primary_category_id=".$row->id." ORDER BY id_sub");
               $query_respons_secondary = $query_secondary->result();
               $sub_categorys = array();
               foreach($query_respons_secondary as $row_secondary) {                 
                    array_push($sub_categorys,get_object_vars($row_secondary) );
               }
               $primary_cat = get_object_vars($row);
               $primary_cat['subcategories'] = $sub_categorys;
               array_push($primary_categorys, $primary_cat);
        }
        return $primary_categorys;     
        }
    }
    function getCategorysforMobile($region_id) {
        $sql = "SELECT id, name_et as name FROM categories WHERE region_id=".$region_id." ORDER BY id;";
        return $this->getCategories($sql);     
    }
    function getCategorysforWeb($region_id) { 
        #$query = $this -> db -> query("SELECT sub_categories.id_sub as id_sub, sub_categories.name_et as sub_name, categories.color as color, categories.name_et as pri_name, categories.id as primary_id FROM sub_categories, categories WHERE sub_categories.primary_category_id=categories.id");
        $sql = "SELECT id, name_et as name, color FROM categories WHERE region_id=".$region_id." ORDER BY id;";
        return $this->getCategories($sql);     
    }
    
    function deleteCategory($id, $parent = 0){
        if ($parent == 1){
            $sql = "DELETE FROM categories WHERE id='".$id."'";
            $query = $this -> db -> query("SELECT COUNT(*) AS points from issues WHERE category='".$id."' AND visibility=TRUE");
            $count = $query->row();
			$query1 = $this -> db -> query("SELECT COUNT(*) AS subs from sub_categories WHERE primary_category_id='".$id."'");
            $count1 = $query1->row();
            if($count->points > 0 || $count1->subs > 0) return "Ei saa kustutada kategooriat mis sisaldab punkte v&otilde;i alamkategooriaid";
            $query2 = $this -> db -> query($sql);
            $this->updateRevisions();
        } else {
            $sql = "DELETE FROM sub_categories WHERE id_sub='".$id."'";
            $query = $this -> db -> query("SELECT COUNT(*) AS points from issues WHERE subcategory='".$id."' AND visibility=TRUE");
            $count = $query->row();
            if($count->points > 0) return "Ei saa kustutada kategooriat mis sisaldab punkte";
            $query2 = $this -> db -> query($sql);
            $this->updateRevisions();
        }
        return "OK";
    }
    function addCategory($name, $color, $parent, $region_id = 1){        
        if ($parent == 0){
            $q1 = $this -> db -> query("SELECT max(id) AS id FROM categories");
            $r1 = $q1->row(); 
            $sql = "INSERT INTO categories (id, name_et, name_ru, name_en, color, region_id) VALUES ('".($r1->id+1)."', '".$name['et']."', '".$name['ru']."', '".$name['en']."', '".$color."', '".$region_id."')";
            $r = "Main";
        }
        else{
            $q1 = $this -> db -> query("SELECT max(id_sub) AS id FROM sub_categories");
            $r1 = $q1->row();
            $sql = "INSERT INTO sub_categories (id_sub, name_et, name_ru, name_en, primary_category_id) VALUES ('".($r1->id+1)."', '".$name['et']."', '".$name['ru']."', '".$name['en']."', '".$parent."')";
            $r = "Sub";
        }
        $query = $this -> db -> query($sql);
        $this->updateRevisions();
        return "Lisatud.";
    }
    function getCategoryData($id, $sub){
        if($sub == 1){
            $sql = "SELECT name_et, name_ru, name_en, primary_category_id FROM sub_categories WHERE id_sub='".$id."'";
        }
        else {
            $sql = "SELECT name_et, name_ru, name_en, color FROM categories WHERE id='".$id."'";
        }
        $query = $this -> db -> query($sql);
        
        return $query->row();
    }
    function saveCategory($id, $sub, $params){
        if($sub == 1){  //alamkategooria salvestamine
            $sql = "UPDATE sub_categories SET name_et='".$params['name_et']."', name_ru='".$params['name_ru']."', ".
                "name_en='".$params['name_en']."', primary_category_id='".$params['primary_category_id']."' WHERE id_sub='".$id."'";
        }
        else {
            $sql = "UPDATE categories SET name_et='".$params['name_et']."', name_ru='".$params['name_ru']."', ".
                "name_en='".$params['name_en']."', color='".$params['color']."' WHERE id='".$id."'";
        }
        $query = $this -> db -> query($sql);
        $this->updateRevisions();        
        return "OK";
    }
    function updateRevisions(){
		$this->load->library('session');
        $userdata = $this->session->userdata('logged_in');
        $uid = $userdata['id'];
        $rid = $userdata['region_id'];
        $sql = "INSERT INTO category_revisions (modify_date, user_id, region_id) VALUES (NOW(), '".$uid."', '".$rid."')";
        $query = $this -> db -> query($sql);
    }
}

?>
