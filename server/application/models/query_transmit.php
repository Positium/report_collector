<?php

Class Query_transmit extends CI_Model {
    //
    function get_reports_from_db() {
        $query_for_properties = $this -> db -> query("SELECT issues.id, issues.timestamp_n, categories.name_et as category, categories.color as color, issues.commentary, issues.photo FROM issues, categories categories WHERE issues.category= categories.id");
        $query_for_location = $this -> db -> query("SELECT ST_AsGeoJSON(location_n,4,0) as location FROM issues");       
        if ($query_for_properties->num_rows() > 0 && $query_for_properties->num_rows() > 0) {
            $query_resultset_for_properties = $query_for_properties->result();
            $query_resultset_for_location = $query_for_location->result();
            return array($query_resultset_for_properties, $query_resultset_for_location);         
        } else {
            return null;
        }           
    }
}

?>
