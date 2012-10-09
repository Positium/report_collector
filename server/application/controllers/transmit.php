<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Transmit extends CI_Controller {

    function __construct() {
        parent::__construct();
        error_reporting(E_ALL);
        ini_set('display_errors',1);
        $this->load->model('query_transmit');
    }
    public function index() {
        
        $query_resultsets = $this->query_transmit->get_reports_from_db();
        $data['geojson_file'] = $this->resultsets_to_GeoJSON($query_resultsets);
        $this->load->view('geojson_respond', $data);
    }
    public function resultsets_to_GeoJSON($query_resultsets) {
        $query_resultset_for_properties = $query_resultsets[0];
        $query_resultset_for_location = $query_resultsets[1];
        
        $array_of_features=array();
        $count_of_reports = count($query_resultset_for_properties);
        for ($i = 0;$i < $count_of_reports && $i < $count_of_reports;++$i) {
            $row_of_properties = $query_resultset_for_properties[$i];
            $row_of_location = $query_resultset_for_location[$i];
            $report_properties = array(
                "ID" => $row_of_properties->id,
                "TIMESTAMP" => $row_of_properties->timestamp_n,
                "CATEGORY" => $row_of_properties->category,
                "COMMENTARY" => $row_of_properties->commentary,
                "PICTURE" => base64_encode(pg_unescape_bytea($row_of_properties->photo))   
                );
            $feature = array(
                "type" => "Feature",
                "properties" => $report_properties,
                "geometry" => json_decode($row_of_location->location)
                );
            array_push($array_of_features, $feature);
        }
        $complete_geojson = array(
            "type" => "FeatureCollection",
            "features" => $array_of_features   
            );        
        return str_replace('\\','', json_encode($complete_geojson));
    }
}
?>
