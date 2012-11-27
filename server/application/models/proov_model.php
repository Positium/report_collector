<?php

class proov_model extends CI_Model {

	function getData() {
		$this-> db-> select ('version()');
                $query = $this->db->get();
                if ($query->num_rows()>0) {
			return $query->row();
		} else {
			return $query->row();
		}
	}
}
?>
