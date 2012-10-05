<?php

 Class Report_post extends CI_Model
    {
     function insert_report($report)
     {
        $this -> db ->set('device_id', $report['device_id'], TRUE);
        $this -> db ->set('timestamp_n', $report['timestamp_n'], TRUE);
        $this -> db ->set('category', $report['category'], TRUE);
        $this -> db ->set('commentary', $report['commentary'], TRUE);
        $this -> db ->set('location_n', $report['location_n'], FALSE);
        $this -> db ->set('photo', $report['photo'], TRUE);
        $this -> db ->set('gps_accuracy', $report['gps_accuracy'], TRUE);
        $this -> db ->insert('issues');
        return $this->db->insert_id();
        //$ids = "id = 116";
        //$this -> db ->select('location_n');
        //$this -> db ->select('timestamp_n');
        //$this -> db -> from('issues');
        //$this -> db ->where('id"="11');
        //$query = $this -> db -> query("SELECT ST_AsGeoJSON(location_n) as rt FROM issues WHERE id =15");
       
        
        //$query = $this->db->get();
        //var_dump($query);
        //$data = ob_get_clean();
        //file_put_contents("./uploads/info2.txt",$data);
        /*
        $arr_properties=null;
        $geometry = null;
        
         */
            
            
        
            
        //}
          
         
        
        /*
         $query = $this -> db -> query("SELECT row_to_json(fc) FROM
                                      (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
                                      FROM (SELECT 'Feature' As type
                                      , ST_AsGeoJSON(location_n)::json As geometry
                                      , row_to_json((SELECT l FROM (SELECT timestamp_n,id) As l
                                      )) As properties
                                      FROM issues As lg ) As f) As fc");

        */
        //$jdata = ob_get_clean();
       
     }
    }
?>
