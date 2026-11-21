<?php

if($_POST["phoneno"]!="" && $_POST["producttype"]!="" && $_POST["onetimeno"]!=""){

$phoneno=$_POST["phoneno"];
$producttype=$_POST["producttype"];
$onetimeno=$_POST["onetimeno"];


$con=mysqli_connect("localhost","root","","donationdb");
$sql_retrieve_fordelete="select * from helpinfo";
$res=mysqli_query($con,$sql_retrieve_fordelete);
	
	while($row=mysqli_fetch_array($res)){
        	if($row[1]==$phoneno && $row[2]==$producttype && $row[4]==$onetimeno) {
		$sqlfordelete="delete from helpinfo where phoneno='$phoneno' AND 		producttype='$producttype' AND onetimeno='$onetimeno'";
		mysqli_query($con,$sqlfordelete);
 		echo "<center>"."product deleted..you will be rediected to main page back in 3 					seconds.."."</center>";
		header("refresh:3;url=main.php");
                exit;


                       }
		
		}

echo "<center>"."information given not match"."<center>";
header("refresh:3;url=deleteform.php");





	

}

else{ 
echo "<center>"."Please fill in all fields...wait a moment..."."<center>"; 
header("refresh:1;url=deleteform.php");
}



?>