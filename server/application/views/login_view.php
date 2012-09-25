<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
 <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
   <title>LogIn</title>
 </head>
 <body>
   <h1>Sisene süsteemi</h1>
   <?php echo validation_errors(); ?>
   <?php echo form_open('verifylogin'); ?>
     <label for="username">Kasutajatunnus:</label>
     <input type="text" size="20" id="username" name="username"/>
     <br/>
     <label for="password">Parool:</label>
     <input type="password" size="20" id="passowrd" name="password"/>
     <br/>
     <input type="submit" value="Sisene"/>
   </form>
 </body>
</html>