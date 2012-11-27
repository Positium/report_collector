<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

header('Access-Control-Allow-Origin: *');

class Transmit extends CI_Controller {
#Comment
    function __construct() {
        parent::__construct();
        $this->load->library('session');
        error_reporting(E_ALL);
        ini_set('display_errors',1);
        if (!$this->session->userdata('logged_in')) {
            redirect('login');
        }     
        $this->load->model('query_transmit');
    }
    public function index() {
        
        $userdata = $this->session->userdata('logged_in');
        $query_resultsets = $this->query_transmit->get_reports_from_db($userdata['region_id']);
        $data['geojson_file'] = $this->resultsets_to_GeoJSON($query_resultsets);
        $this->load->view('geojson_respond', $data);
    }
    private function resultsets_to_GeoJSON($query_resultsets) {
        //$query_resultset_for_properties = $query_resultsets[0];
        $query_resultset_for_properties = $query_resultsets;
        //$query_resultset_for_location = $query_resultsets[1];      
        $array_of_features=array();
        $count_of_reports = count($query_resultset_for_properties);
        for ($i = 0;$i < $count_of_reports && $i < $count_of_reports;++$i) {
            $row_of_properties = $query_resultset_for_properties[$i];
            $report_properties = array(
                "ID" => $row_of_properties->id,
                "TIMESTAMP" => $row_of_properties->timestamp_n,
                "CATEGORY" => $row_of_properties->category,
                "ID_SUBCATEGORY"=> $row_of_properties->category_id,
                "ID_CATEGORY"=> $row_of_properties->primary_id,
                "COMMENTARY" => $row_of_properties->commentary,
                "COLOR" =>$row_of_properties->color,
                "GPS_ACCURACY"=>$row_of_properties->gps_accuracy."m",
                );
            $feature = array(
                "type" => "Feature",
                "properties" => $report_properties,
                "geometry" => json_decode($row_of_properties->location)
                );
            array_push($array_of_features, $feature);
        }
        $complete_geojson = array(
            "type" => "FeatureCollection",
            "features" => $array_of_features   
            );        
        return json_encode($complete_geojson);
    }
    public function getPhotoById() {
        if (isset($_GET['id'])) {
            $photo_result = $this->query_transmit->get_photo_by_id($this->input->get('id'));
            $photo_string = $photo_result->photo;
            $photo_json['photo_json'] = $photo_string;
            $this->load->view('photo_respond',$photo_json);
        }
    }
    public function getCategoryList() {
        if (isset($_GET['list'])) {
            $this->load->model('query_categories');
            $query_resultsets = $this->query_categories->respond_query_id();
            $list = '';
            foreach($query_resultsets as $row) {
                $list .= $row->id.',';
            }
            $arrayOfIDs['data'] = $list;
            $this->load->view('category_respond',$arrayOfIDs);
        }
    }
    
}
?>
