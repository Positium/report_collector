<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Transmit extends CI_Controller {

    function __construct() {
        parent::__construct();
        error_reporting(E_ALL);
        ini_set('display_errors',1);

        $this->load->model('query_transmit');
    }
    public function index() {
        
        $this->query_transmit->respond_query();
    }
    
}
?>
