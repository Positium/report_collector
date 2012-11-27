<?php
if (!defined('BASEPATH'))
    exit('No direct script access allowed');
?>
<!DOCTYPE HTML>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="author" content="" />
        <title>Report Collector</title>
        <!-- webpage style -->
        <link rel="stylesheet" href="../css/style.css" type="text/css" />
        <!-- OpenLayers -->
        <script src="../js/libs/openlayers/OpenLayers.js"></script>
        <!-- jQuery -->
        <script src="../js/libs/jquery/jquery-1.8.2.js"></script>
        <script src="../js/libs/jquery/jquery-ui-1.9.1.custom.min.js"></script>
        <script src="../js/libs/jquery/jquery.ui.datepicker-et.js"></script>
        <script src="../js/libs/jquery/jquery.ui.datepicker-ru.js"></script>
        <script src="../js/libs/jscolor/jscolor.js"></script>
        <!-- DatePicker -->
        <link rel="stylesheet" href="../css/smoothness/jquery-ui-1.9.1.custom.css" />
        <!-- Underscore & Backbone -->
        <script type="text/javascript" src="../js/libs/underscore/underscore.js" ></script>
        <script type="text/javascript" src="../js/libs/backbone/backbone.js" ></script>
        <script type="text/javascript" src="../js/libs/openlayers/animatedcluster.js" ></script>
        <!-- Site script -->
        <script src="../js/script.js"></script> 
    </head>
    <body>
        <div id = "container">

            <div id="topmenu"></div>
            <div id="userdata"></div>
            <div id="legend">
                <div> <input type="checkbox" id="check-cluster"  checked="checked" /><label for = "check-cluster" >Klasterda</label></div>
                <div> <input type="checkbox" id="cluster" /><label for = "cluster" >Klasterda ruumiliselt ja ajaliselt</label></div>
                <div id="catecory">
                </div>
                <div id ="time-interval"> 
                    <label>Vali ajavahemik</label><br/>
                    <input type="text" class="datepicker" id = "time-start" name="date1" style="width: 90px;"/>
                    <label>kuni</label>
                    <input type="text" class="datepicker"  id ="time-end" name="date2" style="width: 90px;"/>
                </div>
            </div>
            <div id="info">
                <a href="" id="close" ></a>
                <div id ="clusters">
                </div>
            </div>
            <div id = "map">
            </div>
        </div>
        <div id="categoriesEditContainer">
            <a href="" id="close2" ></a>
            <div id="categoriesEdit"></div>
        </div>
        <div id="loading"></div>     		
    </body>
</html>