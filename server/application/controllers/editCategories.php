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
    
    public function delete($id) {
        echo $this->query_categories->deleteCategory($id);
    }
    public function add() {
        $name = $_POST['name'];
        $color = "#".$_POST['color'];
        $parent = $_POST['parent'];
        //echo $name.'|'.$color.'|'.$parent;
        echo $this->query_categories->addCategory($name, $color, $parent);
    }
    public function addForm() {
        $categories = $this->query_categories->respond_query_name();
        $sel = '<select id="catParent" name="parent">';
        foreach($categories as $row) {
            $sel .= '<option value="'.$row->id.'" >'.$row->name_et.'</option>';
        }
        $sel .= '</select>';

        $form = '<h3>Lisa uus kategooria</h3>'.
            'Kategooria nimi: <input id="catName" type="text" /><br/>'.
            //'Kategooria v&auml;rv: <input id="catColor" type="text" value="e244cf" /><br/>'.
            //'&Uuml;lemkategooria: <input id="catParent" type="text" /><br/>'.
            '&Uuml;lemkategooria: '.$sel.'<br/>'.
            '<br/><button id="submitCategory" >Lisa</button>'.
            '&nbsp;&nbsp;&nbsp;<button id="cancelAdd" >Tagasi</button>'.
            '<script type="text/javascript">'.
            '  $.fn.jPicker.defaults.images.clientPath="../css/jpicker-images/";'.
            '  $("#catColor").jPicker({ window: { expandable: true } });'.
            '</script>'.
            '';
        echo $form;
    }

}
?>