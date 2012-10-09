<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Algus extends CI_Controller {
    
    function __construct() {
        parent::__construct();
        error_reporting(E_ALL);
        ini_set('display_errors',1);
        $this->load->model('report_post');
    }
    public function index()
    {   
        if (isset($_POST)) {    
            $string_photo=explode(",",$_POST['photo']);    
            $image_string = str_replace(array("\\\\", "''"), array("\\", "'"),pg_escape_bytea(base64_decode($string_photo[1])));
            
            $report = array(
                'device_id' => $_POST['uuid'],
                'timestamp_n' => date("Y-m-d",$_POST['timestamp']),
                'category' => $_POST['category'],
                'commentary' => $_POST['comment'],
                'location_n' => "ST_Transform(ST_GeomFromText('POINT(".$_POST['geolocation']['longitude']." ". $_POST['geolocation']['latitude'].")',4326),900913)",
                'photo' => $image_string,
                'gps_accuracy' => $_POST['geolocation']['accuracy'],
            );   
            $report_id = $this->report_post->insert_report($report);
            $respons = array(
                'result'=>'success',
                'id'=>$report_id
                );
            $data_to_view['response'] = json_encode($respons);
            $this->load->view('id_to_mobapp',$data_to_view);
         
            //$data = json_decode($_POST['report']);
            //$img= imagecreatefromstring($image_string);
            //imagejpeg($img,'./uploads/suur.jpeg');
            //$andmed = $data['timestamp'] . "\n";
            //$andmed = $_POST["name"]."\n";
            //$andmed = "proov";
            //file_put_contents("./uploads/info.txt",$data );
            //file_put_contents("./uploads/info.jpeg",$image_string);
            //$fail = fopen("./uploads/suur",'a');
            //fwrite($fail, $image_string);
            //fclose($fail);

            //$this->load->view('index.html');
        } else {
            echo "ei";
        }
    }
}
?>