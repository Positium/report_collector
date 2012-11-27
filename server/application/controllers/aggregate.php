<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
header('Access-Control-Allow-Origin: *');
class Aggregate extends CI_Controller {
    
    function __construct() {
        parent::__construct();
        $this->load->library('session');
        error_reporting(E_ALL);
        ini_set('display_errors',1);
        if (!$this->session->userdata('logged_in')) {
            redirect('login');
        }     
        $this->load->model('aggregate_reports');
    }
    function index() {
        
        $userdata = $this->session->userdata('logged_in');
        $time = 0;
        
        $time = strval($_GET['time']);
        $range = strval($_GET['range']);
        $select = $_GET['select'];
        
        $results = $this->aggregate_reports->aggregate($range, $time, $select, $userdata['region_id']);
        $res = array();
        foreach($results as $row) {
            array_push($res,$row->element);  
        }
        echo json_encode(array("clusters"=>$res));
    }
}
?>
