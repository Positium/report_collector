<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
header('Access-Control-Allow-Origin: *');
class editCategories extends CI_Controller {

    function __construct() {
        parent::__construct();
        error_reporting(E_ALL);
        ini_set('display_errors',1);

        $this->load->model('query_categories');
        $this->load->library('session');
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
    public function deleteTop($id) {
        echo $this->query_categories->deleteCategory($id, 1);
    }
    public function add() {
        //$this->load->library('session');
        $userdata = $this->session->userdata('logged_in');
        $name['et'] = $_POST['name_et'];
        $name['ru'] = $_POST['name_ru'];
        $name['en'] = $_POST['name_en'];
        $color = isset($_POST['color']) ? "#".$_POST['color'] : '';
        $parent = isset($_POST['parent']) ? $_POST['parent'] : 0;
        //echo $name.'|'.$color.'|'.$parent;
        echo $this->query_categories->addCategory($name, $color, $parent, $userdata['region_id']);
    }
    public function addForm() {
        $userdata = $this->session->userdata('logged_in');
        $categories = $this->query_categories->respond_query_name($userdata['region_id']);
        $sel = '<select id="catParent" name="parent" onChange="showC()">'.
            '<option value="0" >--pole--</option>';
        foreach($categories as $row) {
            $sel .= '<option value="'.$row->id.'" >'.$row->name_et.'</option>';
        }
        $sel .= '</select>';

        $form = '<h3>Lisa uus kategooria</h3>'.
            'Kategooria nimi: <br/>'.
                '&nbsp;&nbsp;eesti: <input id="catName_et" type="text" value=""/><br/>'.
                '&nbsp;&nbsp;inglise: <input id="catName_en" type="text" value=""/><br/>'.
				'&nbsp;&nbsp;vene: <input id="catName_ru" type="text" value=""/><br/>'.
            //'&Uuml;lemkategooria: <input id="catParent" type="text"/><br/>'.
            '&Uuml;lemkategooria: '.$sel.'<br/>'.
            'Kategooria v&auml;rv: <input id="catColor" class="colorPicker" type="text" /><br/>'.
            '<br/><button id="submitCategory" >Lisa</button>'.
            '&nbsp;&nbsp;&nbsp;<button id="cancelAdd" >Tagasi</button>'.
            '<script>'.
            'jscolor.init();'.
            'function showC(){'.
            ' if($("#catParent").val()==0) $("#catColor").show();'.
            ' else $("#catColor").hide();'.
            '}'.
            '</script>'.
            '';
        echo $form;
    }
    public function edit() {
        $id =  $_POST['id'];
        $sub = $_POST['sub'];
		if($sub == 1){ //alamkategooria salvestamine
			$params = array('name_et'=>$_POST['name_et'],
				'name_en'=>$_POST['name_en'],
				'name_ru'=>$_POST['name_ru'],
				'primary_category_id'=>$_POST['parent']);
        } else { //põhikategooria
			$params = array('name_et'=>$_POST['name_et'],
				'name_en'=>$_POST['name_en'],
				'name_ru'=>$_POST['name_ru'],
				'color'=>"#".$_POST['color']);
        }
        echo $this->query_categories->saveCategory($id, $sub, $params);
    }
    public function editForm($id, $sub=1) {
        $cat = $this->query_categories->getCategoryData($id, $sub);
        if($sub == 1){ //alamkategooria muutmine
            $userdata = $this->session->userdata('logged_in');
            $categories = $this->query_categories->respond_query_name($userdata['region_id']);
            $sel = '<select id="catParent" name="parent">';
            foreach($categories as $row) {
                $sel .= '<option value="'.$row->id.'" ';
				if($row->id == $cat->primary_category_id) $sel .= 'selected ';
                $sel .= '>'.$row->name_et.'</option>';
            }
            $sel .= '</select>';

            $form = '<h3>Muuda kategooriat</h3>'.
                'Kategooria nimi: <br/>'.
                '&nbsp;&nbsp;eesti: <input id="catName_et" type="text" value="'.$cat->name_et.'"/><br/>'.
                '&nbsp;&nbsp;inglise: <input id="catName_en" type="text" value="'.$cat->name_en.'"/><br/>'.
				'&nbsp;&nbsp;vene: <input id="catName_ru" type="text" value="'.$cat->name_ru.'"/><br/>'.
                '&Uuml;lemkategooria: '.$sel.'<br/>'.
                '<input id="catId" type="hidden" value="'.$id.'"/>'.
                '<br/><button id="submitEditCategory" >Salvesta</button>'.
                '&nbsp;&nbsp;&nbsp;<button id="cancelBtn" >Tagasi</button>'.
                '';
        } else { //põhikategooria
            $form = ''.
                '<h3>Muuda kategooriat</h3>'.
				'Kategooria nimi:<br/>'.
                '&nbsp;&nbsp;eesti: <input id="catName_et" type="text" value="'.$cat->name_et.'"/><br/>'.
                '&nbsp;&nbsp;inglise: <input id="catName_en" type="text" value="'.$cat->name_en.'"/><br/>'.
				'&nbsp;&nbsp;vene: <input id="catName_ru" type="text" value="'.$cat->name_ru.'"/><br/>'.
                'Kategooria v&auml;rv: <input id="catColor" class="colorPicker" type="text" value="'.ltrim($cat->color, '#').'" /><br/>'.
                '<input id="catId" type="hidden" value="'.$id.'"/>'.
                '<br/><button id="submitEditCategory" >Salvesta</button>'.
			    '&nbsp;&nbsp;&nbsp;<button id="cancelBtn" >Tagasi</button>'.
                '<script>jscolor.init();</script>'.
                '';
        }
        echo $form;
    }

}
?>