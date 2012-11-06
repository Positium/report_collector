<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
header('Access-Control-Allow-Origin: *');
class editCategories extends CI_Controller {

    function __construct() {
        parent::__construct();
        error_reporting(E_ALL);
        ini_set('display_errors',1);

        $this->load->model('query_categories');
    }
    public function index() {
        
        $query_response = $this->query_categories->respond_query();
        $cat = '';
        if (is_array($query_response)) {
            foreach($query_response as $row) {
                $cat .= '<li><div class="catcolor" style="background-color: '.
                        $row->color.';"></div> <div class = "catcolor2" id = "'.$row->name. $row->id. '">'.
                            '<input type="checkbox" class="catSelect" id = "'.$row->name. '" value="'.$row->id.
                        '" checked="checked" />'. '<label for="'.$row->name.'">'.$row->name.
                        '</label>'.'</div> </li>';
            }
        }
        $categories_html = '<ul>'.$cat.'</ul>';
//lisada juurde javascript andmete saatmiseks serverisse -> $.post....
//siia faili ka salvestamise tegevused
//query_categories lisada salvestamise päring (?)
        echo $categories_html;
    }
    
}
?>