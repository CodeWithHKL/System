<?php
session_start();
$beneficiary=$_SESSION['beneficiary'];
$producttype=$_SESSION['producttype'];
$productname=$_SESSION['productname'];
if($beneficiary!="" && $producttype!="" && $productname!=""){

$con=mysqli_connect("localhost","root","","donationdb");
$sql_listhelper="select * from helpinfo";

$res=mysqli_query($con,$sql_listhelper);
	echo "<center>"."<table>"."<tr>"."<td>"."Name"."</td>"."<td>"."Contact NO"."</td>"."<td>"."Type"."</td>"."<td>"."Item"."</td>"."<td>"."Date posted"."</td>"."<td>"."Time posted"."</td>"."<td>"."</td>"."<td>"."</td>"."</tr>"."</table>"."</center>";
		while($row=mysqli_fetch_array($res)){
     
              if($check=preg_match("/$productname/",strtolower($row[3]))){

echo "<center><b>"."<table>"."<tr>"."<td>".$row[0]."</td>"."<td>".$row[1]."</td>"."<td>".$row[2]."</td>"."<td>".$row[3]."</td>"."<td>".$row[5]."</td>"."<td>".$row[6]."</td>"."<td>".$row[7]."</td>"."<td>".$row[8]."</td>"."</tr>"."</table>"."</b></center>"."<br>"; }
		
		
  	}
	echo "<center>"."<br>"."If nothing appeared, or you wanna make a new search, then you may try to find again.."."<br>"."<a href='main.php'>Find again</a>"."</center>";
}


else{
echo "<center>"."Opppsss!    "."Plese fill all fields"."</center>";
header("refresh:2;url=main.php");


}


?>