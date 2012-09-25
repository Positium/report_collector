<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Algus extends CI_Controller {
    
    function __construct() {
        parent::__construct();
        error_reporting(E_ALL);
        ini_set('display_errors',1); 
    }
    public function index()
    {   
        //if (isset($_POST["nimi"])) {
            
            $target_path= "uploads/";
            $target_path = $target_path . basename( $_FILES['userfile']['name']); 
            
            if(move_uploaded_file($_FILES['userfile']['tmp_name'], $target_path)) {
                echo "The file ".  basename( $_FILES['userfile']['name']). 
                    " has been uploaded";
            } else{
                echo "There was an error uploading the file, please try again!";
            }
            //$andmed = "Suurus on: ". $_FILES['userfile']['error'];
            //$andmed = $_POST["name"]."\n";
            //$andmed = "proov";
            //$fail = fopen("./uploads/suur",'a');
            //fwrite($fail, $andmed);
            //fclose($fail);
        //} else {
            
        //    echo "Ei ole";
        //}
        
        //$this->load->view('index.html');
    }
}
?>