<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

Class Edit_Report_Model extends CI_Model {
    
    function hide_report($report_id,$region_id) {
        $data = array('visibility'=>'f');
        $this->db->where('id',$report_id);
        $this->db->where('region_id',$region_id);
        $this->db->update('issues', $data);
        return;
    }
}
?>
