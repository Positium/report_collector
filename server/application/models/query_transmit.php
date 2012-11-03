<?php

Class Query_transmit extends CI_Model {
    //
    function get_reports_from_db() {
        $query_for_properties = $this -> db -> query("SELECT issues.id,issues.timestamp_n, 
                                                      CASE WHEN (SELECT get_subcategory_id_count(issues.subcategory))>0 
                                                      THEN (SELECT get_subcategory_name(issues.subcategory)) 
                                                      ELSE (SELECT get_category_name(issues.category)) END as category,
                                                      issues.category as primary_id, issues.subcategory as category_id,
                                                      categories.color as color,issues.commentary, issues.gps_accuracy 
                                                      FROM issues, categories WHERE issues.category=categories.id;");
        $query_for_location = $this -> db -> query("SELECT ST_AsGeoJSON(location_n,4,0) as location FROM issues");       
        if ($query_for_properties->num_rows() > 0 && $query_for_properties->num_rows() > 0) {
            $query_resultset_for_properties = $query_for_properties->result();
            $query_resultset_for_location = $query_for_location->result();
            return array($query_resultset_for_properties, $query_resultset_for_location);         
        } else {
            return null;
        }
    }
    function get_photo_by_id($id) {
        $query_for_picture = $this->db-> query("SELECT photo FROM issues WHERE id=".$this->db->escape($id)." LIMIT 1");
        return $query_for_picture->row();
    }
}

?>
