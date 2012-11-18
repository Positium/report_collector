<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
Class Region_Model extends CI_Model {
    
    function get_RegionID_by_coords($coords) {
        $transform_coords = $this->db ->query("SELECT ST_Transform(ST_GeomFromText('POINT(".$coords['longitude']." ". $coords['latitude'].")',4326),900913) as coords");
        $transform_result = $transform_coords->row();
        $query = $this -> db -> query("SELECT id FROM regions 
                                       WHERE ST_Within('".$transform_result->coords."', bbox_mobile) LIMIT 1;");
        
        if ($query->num_rows() <= 0) {
            $query = $this -> db -> query("SELECT id, 
                                           ST_Distance('".$transform_result->coords."',bbox_mobile) as distance 
                                           FROM regions 
                                           GROUP BY distance, id 
                                           HAVING ST_Distance('".$transform_result->coords."',bbox_mobile)>0 
                                           ORDER BY distance LIMIT 1");
        }
        $region_id = $query->row(); 
        return $region_id->id;
    }
}
?>