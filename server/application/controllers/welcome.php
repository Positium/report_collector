<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Welcome extends CI_Controller {
    
    function __construct() {
        parent::__construct();
    }
    public function index()
	{   
            error_reporting(E_ALL);
            ini_set('display_errors',1); 
            $this->load->model('proov_model');
            $data['result'] = $this->proov_model->getData();
            $data['page_title'] = "CI app";
            $this->load->view('proov_view',$data);
	}
        
}
?>