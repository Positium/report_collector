<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
header('Access-Control-Allow-Origin: *');
session_start();
class getuser extends CI_Controller {

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
      // lugeda andmebaasist nt nimi ja kuvada seda
      /*$query = $this -> db -> query("SELECT name FROM users WHERE username='".$data['username']."'");
        if ($query->num_rows() > 0) {
            $query_respons_p = $query->result();
            foreach($query_respons_p as $row) {
                echo $row->name.", ";
            }
        }
        */
        echo $data['username']; //testimiseks
    }
    else {
        echo "";
    }
 }
}
?>
