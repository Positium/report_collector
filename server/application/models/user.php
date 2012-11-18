<?php
Class User extends CI_Model  {
    function login($username, $password) {
        $this -> db -> select('users.username as username, users.id as id, users.usergroup_id as usergroup_id, 
                               usergroups.region_id as region_id');
        $this -> db -> from('users, usergroups');
        $this -> db -> where('username = ' . "'" . $username . "'");	   
        $this -> db -> where('users.password = crypt(' . "'" .$password . "'".',users.password)');
        $this -> db -> where('usergroups.id = usergroup_id');
        $this -> db -> limit(1);
        $query = $this -> db -> get();

        if($query -> num_rows() == 1) { 
            return $query->row();
        }
        return false;
        
    }
}
?>