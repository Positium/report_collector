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
        //var_dump($_POST); 
        if (isset($_POST)) {
            $json_data = $_POST['photo'];
            //$jdata = ob_get_clean();
            //file_put_contents("./uploads/suurus.txt",strlen(http_build_query($_POST)) );
            
            file_put_contents("./uploads/error.txt",$json_data);
            $ifs=explode(",",$_POST['photo']);
            
            $image_string = str_replace(array("\\\\", "''"), array("\\", "'"),pg_escape_bytea(base64_decode($ifs[1])));
            $report = array(
                'device_id' => $_POST['uuid'],
                'timestamp_n' => date("Y-m-d",$_POST['timestamp']),
                'category' => $_POST['category'],
                'commentary' => $_POST['comment'],
                'location_n' => "ST_Transform(ST_GeomFromText('POINT(".$_POST['geolocation']['longitude']." ". $_POST['geolocation']['latitude'].")',4326),900913)",
                'photo' => $image_string,
                'gps_accuracy ' => $_POST['geolocation']['accuracy'],
            );
            file_put_contents("./uploads/geoinfo.txt",$report['gps_accuracy']);     
            $this->report_post->insert_report($report);
         
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