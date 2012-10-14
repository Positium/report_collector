<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
header('Access-Control-Allow-Origin: *');
session_start();
class getmenu extends CI_Controller {

 function __construct()
 {
   parent::__construct();
 }

 public function index()
 {
    if($this->session->userdata('logged_in'))
    {
      $session_data = $this->session->userdata('logged_in');
      $data['username'] = $session_data['username'];
      //andmebaasi tuleks lisada userlevel ??
      //  siis saaks ka teha erinevad menüüd
      $menu =  '<ul>'.
              '<li><a href="http://gistudeng.gg.bg.ut.ee/Report_Collector/index.php/">Avaleht</a></li>'.
              '<li><a href="#" id="catView">Kategooriad</a></li>'.
              '<li><a href="#" id="catAdmin">Halda kategooriaid</a></li>'.
              '</ul>';
      echo $menu;
    }
 }
}
?>
