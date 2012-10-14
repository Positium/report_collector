<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
Class Query_categories extends CI_Model {
    
    function respond_query() {
        
        $query = $this -> db -> query("SELECT id, name_et as name, color FROM categories");
        $cat = '';
        if ($query->num_rows() > 0) {
            $query_respons_p = $query->result();
            foreach($query_respons_p as $row) {
                $cat .= '<li><div class="catcolor" style="background-color: '.
                        $row->color.';"></div> <div class = "catcolor2" id = "'.$row->name. $row->id. '">'.
                            '<input type="checkbox" class="catSelect" id = "'.$row->name. '" value="'.$row->id.
                        '" checked="checked" />'. '<label for="'.$row->name.'">'.$row->name.
                        '</label>'.'</div> </li>';
            }
        }
        $categories_html = '<ul>'.$cat.'</ul>';
        echo $categories_html;
    }
}

?>
