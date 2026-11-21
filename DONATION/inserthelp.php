<?php

if($_POST["helpername"]!="" && $_POST["phoneno"]!="" && $_POST["productname"]!="" && $_POST["producttype"]!="" && $_POST["country"]!="" && $_POST['specificlocation']!=""){
$helpername=strtolower($_POST["helpername"]);
$phoneno=$_POST["phoneno"];
$productname=strtolower($_POST["productname"]);
$producttype=$_POST["producttype"];
$country=$_POST["country"];
$specificlocation=$_POST["specificlocation"];
$onetimeno=rand(0,1000000);
date_default_timezone_set("Asia/Singapore");
$date=date("Ymd");
$time=date("H:i:s");
$con=mysqli_connect("localhost","root","","donationdb");
$sql_retrieve="select * from helpinfo";
$res=mysqli_query($con,$sql_retrieve);
	
	while($row=mysqli_fetch_array($res)){
        	if(($row[0]==$helpername && $row[1]==$phoneno && $row[2]==$producttype && $row				[3]==$productname && $row[7]==$country && $row[8]==$specificlocation) || ($row[4]==$onetimeno)) {
 		echo "<center>"."product already exist..you will be rediected to main page back in 3 				seconds.."."<center>";
		header("refresh:3;url=main.php");
                exit;


                       }
		
		}




	
$sql_insert="insert into helpinfo values			        ('$helpername','$phoneno','$producttype','$productname','$onetimeno','$date','$time','$country','$specificlocation')";
mysqli_query($con,$sql_insert);

echo "done...Please remember this one-time number to delete your help in the future<br>";
echo "$onetimeno";
header("refresh:10;url=main.php");


}

else{ 
echo "<center>"."Please fill in all fields...wait a moment..."."<center>"; 
header("refresh:1;url=main.php");
}



?>