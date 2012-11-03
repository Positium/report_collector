<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
if (session_id()!=="") {
    header( 'Location: http://gistudeng.gg.bg.ut.ee/report_collector_web/index.html' ) ;
} else {
    header( 'Location: http://'.$_SERVER['HTTP_HOST'].'/Report_Collector/index.php/home' );
}
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
	<html xmlns="http://www.w3.org/1999/xhtml">
	 <head>
	   <title>Simple Login with CodeIgniter - Private Area</title>
	 </head>
	 <body>
	   <h1>Home</h1>
	   <h2>Welcome <?php echo $username; ?>!</h2>	   
	    <a href="home/logout">Logout</a>
	 </body>
	</html>