<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
	 
	class Login extends CI_Controller {
	 
	 function __construct()
	 {
	   parent::__construct();
           $this->load->library('session');
	 }
	 
	 function index()
	 {
            if($this->session->userdata('logged_in'))
                {
                redirect('home');
                }
            else {
                $this->load->helper(array('form', 'url'));
                $this->load->view('login_view');
            }
           
         }
	 
	}
	 
?>
