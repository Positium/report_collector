<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
header('Access-Control-Allow-Origin: *');
class getCategories extends CI_Controller {

    function __construct() {
        parent::__construct();
        error_reporting(E_ALL);
        ini_set('display_errors',1);

        $this->load->model('query_categories');
    }
    public function index() {
        
        $this->query_categories->respond_query();
    }
    public function getsubCat() {
<<<<<<< HEAD
        $arrayofCategories['data'] = json_encode($this->query_categories->getCategorysforWeb());
        $this->load->view('category_respond',$arrayofCategories);
    }
    public function getsubCatMobile() {
        $arrayofCategories['data'] = json_encode($this->query_categories->getCategorysforMobile());
        $this->load->view('category_respond',$arrayofCategories);
=======
        $this->query_categories->respond_query_full();
>>>>>>> 865d6cd9c158bc7e4a6dfd58090b7e21b13950aa
    }
    
}
?>