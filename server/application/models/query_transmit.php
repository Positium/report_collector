<?php

Class Query_transmit extends CI_Model {
    //
    function get_reports_from_db() {
        $query_for_properties = $this -> db -> query("SELECT issues.id, issues.timestamp_n, sub_categories.name_et as category, issues.category as category_id ,categories.id as primary_id,categories.color as color, issues.commentary, issues.gps_accuracy FROM issues, categories, sub_categories WHERE issues.category=sub_categories.id_sub and sub_categories.primary_category_id=categories.id");
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
