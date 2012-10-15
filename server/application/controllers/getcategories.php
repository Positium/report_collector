<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class getCategories extends CI_Controller {

    function __construct() {
        parent::__construct();
        $this->load->library('session');
        error_reporting(E_ALL);
        ini_set('display_errors',1);
        if (!$this->session->userdata('logged_in')) {
            redirect('login');
        }     
        $this->load->model('query_categories');
    }
    public function index() {
        
        $this->query_categories->respond_query();
    }
    
}
?>