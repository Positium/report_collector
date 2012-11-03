<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Algus extends CI_Controller {
    
    function __construct() {
        parent::__construct();
        $this->load->library('session');
        error_reporting(E_ALL);
        ini_set('display_errors',1);
        $this->load->model('report_post');
    }
    public function index()
    {   
        if($this->session->userdata('logged_in'))
	   {
	     $session_data = $this->session->userdata('logged_in');
	     $data['username'] = $session_data['username'];
	     $this->load->view('main_view', $data);
	   }
	   else
	   {
	     //If no session, redirect to login page
	     redirect('login', 'refresh');
	   }
    }
}
?>
