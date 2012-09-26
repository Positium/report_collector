<?php
//sisselogimine
if(isset($_POST['login']) and $_POST['user'] != '' and $_POST['pass'] != ''){
    if($_POST['user'] == 'admin' and $_POST['pass'] == 'Tartuzeppelin_151'){
        session_start();
        $_SESSION['mapUser'] = $_POST['user'];
        header("Location: index.php");
        return;
    }
    //andmebaasi ühendus
    $sql = "SELECT username, name FROM users WHERE username='".addslashes($_POST['user']).
            "' AND password=PASSWORD('".addslashes($_POST['pass']).")";    
    $conn = pg_connect("host=localhost dbname=mydb user=postgres password=Nolimit123!");
    $res = pg_query($sql);
    //mysql_connect('localhost', 'kasutaja', 'parool') or die(mysql_error());
    //mysql_select_db('andmebaas');
    //kontroll andmebaasist
    
    /*$res = mysql_query($sql);
    if(mysql_num_rows($res) == 1){
        session_start();
        $_r = mysql_fetch_array($res);
        $_SESSION['mapUser'] = $_POST['user'];
        $_SESSION['name'] = $_r['name'];
        header("Location: index.php");
    }*/
    if(pg_num_ows($res) == 1){
        session_start();
        $_r = pg_fetch_array($res);
        $_SESSION['mapUser'] = $_POST['user'];
        $_SESSION['name'] = $_r['name'];
        header("Location: index.php");
    }
    else {
        $err = 'Vale kasutajanimi või parool';
    }
}
//session_start();
if(isset($_SESSION['mapUser']) and $_SESSION['mapUser'] != ''){
    header("Location: index.php");
}
//vorm
?>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="author" content="" />
        <title>Report Collector</title>
        <!-- webpage style -->
        <link rel="stylesheet" href="css/style.css" type="text/css">
    </head>
    <body>
        <div id = "login">
            <form action="login.php" method="post">
                Kasutajanimi:<br/>
                <input type="text" name="user" value="" /><br/>
                Parool:<br/>
                <input type="password" name="pass" value="" /><br/>
                <input type="submit" name="login" value="Logi sisse"/>
            </form>
        </div>
     </div>       
    </body>
</html>
