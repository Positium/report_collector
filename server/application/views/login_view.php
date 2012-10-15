<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
 <head>
    <meta charset="utf-8">
    <title>LogIn</title>
    <style>label { display: block;} </style>
 </head>
 <body>
   <h1>Sisene süsteemi</h1>
   <?php echo validation_errors(); ?>
   <?php echo form_open('verifylogin'); ?>
   <p>
       <?php
            echo form_label('Kasutajatunnus:','username');
            echo form_input('username', set_value('username'),'id="username"');
       ?>
   </p>  
   <p>
       <?php
            echo form_label('Parool:','password');
            echo form_password('password', '','id="password"');
       ?>
   </p> 
   <p>
       <?php
            echo form_submit('submit','Sisene');
       ?>
   </p>
     <?php echo form_close(); ?>
 </body>
</html>