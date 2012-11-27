<html>  
    <head>  
        <title><?php echo $page_title;?></title>  
    </head>  
    <body>  
        <?php 
		//echo $result;
            foreach($result as $row) {
		echo "V22rtus: $row \n";
            }
	?>  
    <form enctype="multipart/form-data" action="__URL__" method="POST">
    <!-- MAX_FILE_SIZE must precede the file input field -->
        <input type="hidden" name="MAX_FILE_SIZE" value="30000" />
    <!-- Name of input element determines name in $_FILES array -->
        Send this file: <input name="userfile" type="file" />
    <input type="submit" value="Send File" />
    </form>            
    </body>  
    </html>  