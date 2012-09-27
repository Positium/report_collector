<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Algus extends CI_Controller {
    
    function __construct() {
        parent::__construct();
        error_reporting(E_ALL);
        ini_set('display_errors',1); 
    }
    public function index()
    {   
        if (isset($_POST["nimi"])) {
            
            //No
            $andmed = "Suurus on: ". $_FILES['userfile']['name'] . "\n";
            //$andmed = $_POST["name"]."\n";
            //$andmed = "proov";
            $fail = fopen("./uploads/suur",'a');
            fwrite($fail, $andmed);
            fclose($fail);
        } else {
            
            echo "Ei ole";
        }
        
        //$this->load->view('index.html');
    }
}
?>