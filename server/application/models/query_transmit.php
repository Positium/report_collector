<?php

Class Query_transmit extends CI_Model {
    
    function respond_query() {
        
        $query = $this -> db -> query("SELECT id, timestamp_n, category, commentary FROM issues");
        $query_2 = $this -> db -> query("SELECT ST_AsGeoJSON(location_n,4,0) as rt FROM issues");
        $json_properties=array();
        $geojson_parts=array();
        if ($query->num_rows() > 0) {
            $query_respons_p = $query->result();
            foreach($query_respons_p as $row) {
                //$picture = pg_unescape_bytea($row->photo);
                //file_put_contents("./uploads/pilt_2.jpeg",$picture);
                $point_properties = array(
                    "ID" => $row->id,
                    "TIMESTAMP" => $row->timestamp_n,
                    "CATEGORY" => $row->category,
                    "COMMENTARY" => $row->commentary,
                    //"PICTURE" => $picture     
                    );
                array_push($json_properties, $point_properties );
            }
        }
        //var_dump($json_properties);
        if ($query_2->num_rows() > 0) {
            $i = 0;
            $query_respons_g = $query_2->result();
            foreach($query_respons_g as $row) {
                $point_geometry= $row->rt;
                $point_json = array(
                    "type" => "Feature",
                    "properties" => $json_properties[$i],
                    "geometry" => json_decode($point_geometry)
                    ); 
                array_push($geojson_parts, $point_json);
                $i++;
            }
        }
        $complete_geojson = array(
            "type" => "FeatureCollection",
            "features" => $geojson_parts   
            );
        echo str_replace('\\','', json_encode($complete_geojson));      
    }
}

?>
