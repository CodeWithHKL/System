<?php
session_start();
$_SESSION['beneficiary']=$_POST['beneficiary'];
$_SESSION['producttype']=$_POST['producttype'];
$_SESSION['productname']=strtolower($_POST['productname']);


echo "<center>"."Searching..."."</center>";

header("refresh:1.5;url=gethelp.php");


?>