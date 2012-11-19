<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

header('Access-Control-Allow-Origin: *');

class EditReport extends CI_Controller {
    
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
    function index() {
        
    }
    public function hide() {
        if (isset($_GET['id'])) {
            $userdata = $this->session->userdata('logged_in');
            $this->load->model('edit_report_model');
            $this->edit_report_model->hide_report($_GET['id'],$userdata['region_id']);
        }
        return;
    }
    public function editCat() {
        if (isset($_GET['id'])) {
            $userdata = $this->session->userdata('logged_in');
            $this->load->model('edit_report_model');
            $this->edit_report_model->edit_category($_GET['id'],$userdata['region_id'],$_GET['idcat'],$_GET['idsubcat']);
        }
    }
}
?>
