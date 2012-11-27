<?php

Class Query_transmit extends CI_Model {
    //
    function get_reports_from_db($region_id) {
        $query_for_properties = $this -> db -> query("SELECT issues.id,issues.timestamp_n, 
                                                      CASE WHEN (SELECT get_subcategory_id_count(issues.subcategory))>0 
                                                      THEN (SELECT get_subcategory_name(issues.subcategory)) 
                                                      ELSE (SELECT get_category_name(issues.category)) END as category,
                                                      issues.category as primary_id, issues.subcategory as category_id,
                                                      categories.color as color,issues.commentary, issues.gps_accuracy, 
                                                      ST_AsGeoJSON(location_n,4,0) as location 
                                                      FROM issues, categories WHERE issues.category=categories.id 
                                                      and issues.region_id=".$region_id." and issues.visibility ORDER BY issues.timestamp_n DESC;");    
        if ($query_for_properties->num_rows() > 0 && $query_for_properties->num_rows() > 0) {
            $query_resultset_for_properties = $query_for_properties->result();      
            return $query_resultset_for_properties;
        } else {
            return null;
        }
    }
    function get_photo_by_id($id) {
        $query_for_picture = $this->db-> query("SELECT encode(photo,'base64') as photo FROM issues WHERE id=".$this->db->escape($id)." LIMIT 1");
        return $query_for_picture->row();
    }
    function get_bbox_by_region_id($region_id) {
        $query_for_bbox = $this->db-> query("SELECT ST_XMin(bbox_webclient) as xmin, ST_YMin(bbox_webclient) as ymin, ST_XMax(bbox_webclient) as xmax, ST_YMax(bbox_webclient) as ymax FROM regions WHERE id=".$region_id." LIMIT 1");
        return $query_for_bbox->row();
    }
}

?>
