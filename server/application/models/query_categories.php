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
    
    function getLastCategorysRevision() {
        $query = $this -> db -> query("SELECT max(id) as maxId FROM category_revisions");        
        return $query->row();
    }
    function respond_query_full() { 
        #$query = $this -> db -> query("SELECT sub_categories.id_sub as id_sub, sub_categories.name_et as sub_name, categories.color as color, categories.name_et as pri_name, categories.id as primary_id FROM sub_categories, categories WHERE sub_categories.primary_category_id=categories.id");
        $query_primary = $this -> db -> query("SELECT id, name_et as name , color FROM categories");
        $cat = '';
        if ($query_primary->num_rows() > 0) {
            $query_respons_p = $query_primary->result();
            $primary_categorys = array();
            
            foreach($query_respons_p as $row) {
               $query_secondary = $this -> db -> query("SELECT name_et as name ,id_sub FROM sub_categories WHERE primary_category_id=".$row->id);
               $query_respons_secondary = $query_secondary->result();
               $sub_categorys = array();
               foreach($query_respons_secondary as $row_secondary) {
                    $sub_cat = array(
                        "name"=>$row_secondary->name,
                        "id"=>$row_secondary->id_sub
                    );
                     
                    array_push($sub_categorys,$sub_cat );
               }
               $primary_cat = array(
                   "name"=>$row->name,
                   "id"=>$row->id,
                   "color"=>$row->color,
                   "subcategories"=>$sub_categorys
               );
               array_push($primary_categorys, $primary_cat);
        }
        echo json_encode($primary_categorys);
       
        }
    }
}

?>
