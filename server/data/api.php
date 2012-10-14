<?php

set_time_limit(0);
//database access parameters
$host = "localhost";
$user = "postgres";
$pass = "Nolimit123!";
$db = "mydb";
// open a connection to the database server
$connection = pg_connect("host=$host dbname=$db user=$user
password=$pass");

if (!$connection) {
    die("Could not open connection to database server");
}


$query = "SELECT * from issues_copy;";
$result = pg_query($query);
if (!$result) {
    echo "Problem with query " . $query . "<br/>";
    echo pg_last_error();
    exit();
}
   // echo $result;
 $rows = pg_num_rows($result);
      //if there are any rows
      $elements = '{"type": "FeatureCollection","features": [';
      if ($rows > 0) {
      while ($data = pg_fetch_object($result)) {
      $elements = $elements . '{"type":"Feature","properties":' . '{"ID":' . $data->id .
              ',"TIMESTAMP":' . $data->timestamp . ',"CATEGORY":' . $data->catecory . 
              ',"COMMENTARY":' . $data->commentary .',"PICTURE":' . $data->photo .'},'. 
              '"geometry":{"type":"Point","coordinates":['. $data->coordinates . ','. $data->coordinates .']}},';
      //$elements = $elements . '{"lat":' . $data->olat . ',"lon":' . $data->olon . ',"v":' . $data->poly . ',"ppl":' . $data->arv . '},';
      }
      }
      $elements = substr($elements, 0, -1);
      $elements = $elements . "]}";
      header('Content-type: application/json');
      echo $elements;
      break;


    pg_close($connection);
?>
