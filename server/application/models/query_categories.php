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
    function respond_query_name() {
        $query = $this -> db -> query("SELECT id, name_et, name_en, name_ru FROM categories");
        
        return $query->result();
    }
    function respond_query_id() {
        $query = $this -> db -> query("SELECT id FROM categories");      
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
               $query_secondary = $this -> db -> query("SELECT name_et as name ,id_sub FROM sub_categories WHERE primary_category_id=".$row->id);
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
        $sql = "SELECT id, name_et as name FROM categories WHERE region_id=".$region_id.";";
        return $this->getCategories($sql);     
    }
    function getCategorysforWeb($region_id) { 
        #$query = $this -> db -> query("SELECT sub_categories.id_sub as id_sub, sub_categories.name_et as sub_name, categories.color as color, categories.name_et as pri_name, categories.id as primary_id FROM sub_categories, categories WHERE sub_categories.primary_category_id=categories.id");
        $sql = "SELECT id, name_et as name, color FROM categories WHERE region_id=".$region_id.";";
        return $this->getCategories($sql);     
    }
    
    function deleteCategory($id){
        /*if($id % 100 == 0){
            $sql = "DELETE FROM categories WHERE id='".($id/100)."'";
        } else {
            $sub = $id % 100;
            $sql = "DELETE FROM sub_categories WHERE id='".$sub."'";
        }*/

        $sql = "DELETE FROM sub_categories WHERE id_sub='".$id."'";
        $query = $this -> db -> query("SELECT COUNT(*) AS points from issues WHERE category='".$id."'");
        $count = $query->row();
        if($count->points > 0) return "Ei saa kustutada kategooriat mis sisaldab punkte";
        $query2 = $this -> db -> query($sql);
        return "Kustutatud.";
    }
    function addCategory($name, $color, $parent){        
        if ($parent == 0){
            $q1 = $this -> db -> query("SELECT max(id) AS id FROM categories");
            $r1 = $q1->row(); 
            $sql = "INSERT INTO categories (id, name_et, color) VALUES ('".($r1->id+1)."', '".$name."', '".$color."')";
            $r = "Main";
        }
        else{
            $q1 = $this -> db -> query("SELECT max(id_sub) AS id FROM sub_categories");
            $r1 = $q1->row();
            $sql = "INSERT INTO sub_categories (id_sub, name_et, primary_category_id) VALUES ('".($r1->id+1)."', '".$name."', '".$parent."')";
            $r = "Sub";
        }
        $query = $this -> db -> query($sql);
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
}

?>
