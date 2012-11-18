<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Receiver extends CI_Controller {
    
    function __construct() {
        parent::__construct();
        error_reporting(E_ALL);
        ini_set('display_errors',1);       
    }
    public function index()
    {   
        if (isset($_POST['submit'])) {
            $this->load->model('report_post');
            $string_photo=explode("[removed]",$this->input->post('photo'),2);
	    $image_string = str_replace(array("\\\\", "''"), array("\\", "'"),pg_escape_bytea(base64_decode($string_photo[1])));
            $report = array(
                'device_id' => $this->input->post('uuid'),
                'timestamp_n' => date("Y-m-d H:i:s",$this->input->post('timestamp')),
                'category' => $this->input->post('category'),
                'subcategory'=> $this->input->post('subcategory'),
                'commentary' => $this->input->post('comment'),
                'location_n' => "ST_Transform(ST_GeomFromText('POINT(".$_POST['geolocation']['longitude']." ". $_POST['geolocation']['latitude'].")',4326),900913)",
                'photo' => $image_string,
                'gps_accuracy' => $_POST['geolocation']['accuracy'],
                'visibility' => "t"
            );   
            $report_id = $this->report_post->insert_report($report);
            $respons = array(
                'result'=>'success',
                'id'=>$report_id
                );
            $data_to_view['response'] = json_encode($respons);
            $this->load->view('id_to_mobapp',$data_to_view);
        } else {
            echo "ei";
        }
    }
    public function sendLastCategoryRevisionNumber() {
        if (isset($_POST['lastrevision'])) {
            $this->load->model('region_model');
            $region_id = $this->region_model->get_RegionID_by_coords($_POST['geolocation']);
            $this->load->model('query_categories');
            $revision_number = $this->query_categories->getLastCategorysRevision($region_id);
            $last_revision = $revision_number->maxid;
            if ($last_revision !== $this->input->post('lastrevision')) {
                $catogories_array = $this->query_categories->getCategorysforMobile($region_id);
                $main_array = array(
                                'lastrevision'=>$last_revision,
                                'categories'=> $catogories_array
                );
                //array_push($catogories_array, array('lastrevision'=>$last_revision));
                $category_data['data'] = json_encode($main_array);                
            } else {
                $category_data['data'] = json_encode(array('lastrevision'=>$last_revision));
            }
            $this->load->view('category_respond',$category_data);
        }       
    }   
}
?>
