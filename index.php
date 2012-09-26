<?php
session_start();
if(isset($_SESSION['mapUser']) and $_SESSION['mapUser'] != ''){
    $user = $_SESSION['mapUser'];
} else {
    require_once('login.php');
    return;
}
if(isset($_GET['logout']) and $_GET['logout'] == '1'){
    session_destroy();
    header("Location: index.php");
    exit();
}
?>
<!DOCTYPE HTML>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="author" content="" />
        <title>Report Collector</title>
        <!-- webpage style -->
        <link rel="stylesheet" href="css/style.css" type="text/css" />
        <!-- OpenLayers -->
        <script src="http://www.openlayers.org/api/OpenLayers.js"></script>
        <!-- jQuery -->
        <script src="js/libs/jquery/jquery-1.8.1.min.js"></script>
        <!-- Underscore & Backbone -->
        <script type="text/javascript" src="js/libs/underscore/underscore.js" ></script>
        <script type="text/javascript" src="js/libs/backbone/backbone.js" ></script>
        <!-- Site script -->
        <script src="js/script.js"></script> 
    </head>
    <body>
        <div id = "container">
            <div id = "map">
                <div id ="nupp">
                    <button type="button">Click Me!</button>
            </div>
        </div>
     </div>       
    </body>
</html>
