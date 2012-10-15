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
}

?>
