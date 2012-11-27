<?php
Class Aggregate_reports extends CI_Model {
    
    function aggregate($range, $time, $query_select,$region_id) {
        
        $query_subcat = " and part1.subcategory=part2.subcategory ";
        $query_time = " and abs(extract(epoch from part1.timestamp_n - part2.timestamp_n)/3600)<".$time." ";
        
        switch ($query_select) {
            case 0:
                $query_full = "";
                break;
            case 1:
                $query_full = $query_time;
                break;
            case 2:
                $query_full = $query_subcat;
                break;
            case 3:
                $query_full = $query_time . $query_subcat;
                break;
        }

        $query = $this->db->query("WITH subquery AS (SELECT ST_Intersects(ST_Buffer(part1.location_n,30, 'quad_segs=8'), part2.location_n) as asi, part1.id, array_agg(part2.id) as massiiv 
                                  FROM issues as part1, issues as part2 
                                  WHERE part1.id!=part2.id AND part1.visibility='t' AND part2.visibility='t' 
                                  AND part1.region_id=".$region_id." and part2.region_id =".$region_id.$query_full." 
                                  GROUP BY asi, part1.id 
                                  HAVING ST_Intersects(ST_Buffer(part1.location_n, 30, 'quad_segs=8'), part2.location_n)
                                  ORDER BY part1.id DESC), 
                                  subquery2 AS(SELECT distinct sort(array_append(massiiv,id)) as asi FROM subquery),
                                  subquery3 AS(SELECT proov.asi as element FROM subquery2 as proov WHERE (SELECT count(*) FROM subquery2 as proov2 WHERE proov.asi <@ proov2.asi and proov.asi!=proov2.asi LIMIT 1)=0),
				  subquery4 AS(SELECT element as element FROM subquery3 as part1 WHERE (SELECT count(*) FROM subquery3 as part2 WHERE part1.element && part2.element and part1.element!=part2.element and array_length(part1.element,1) < array_length(part2.element,1))=0),
                                  subquery5 AS(SELECT unnest(element) as element FROM subquery4),
				  subquery6 AS(SELECT id FROM issues WHERE id != ALL(SELECT * FROM subquery5) and visibility='t' and region_id=".$region_id.")
				  SELECT * FROM (SELECT array_to_string(element,',') as element FROM subquery4 UNION ALL SELECT cast(id as text) FROM subquery6) as element ORDER BY element DESC
				  ");
    
        return $query->result();
    }
    
}
?>
