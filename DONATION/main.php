<html>
<body>
<div align="center">
<table class="fonthelper">
<tr><form name="form" action="inserthelp.php" method="post">
<tr><td>Helper name</td><tr></tr><td><input type="text" name="helpername" placeholder='e.g. Nizam'></td></tr>
<tr><td>Contact Number</td></tr><tr><td><input type="text" name="phoneno" placeholder='+60123456789'></td></tr>
<tr><td>Product Type</td><tr></tr><td><select name="producttype">
  <option value="Food">Food</option>
  <option value="Cloth">Cloth</option>
  <option value="Home-Shelter">Home-Shelter</option>
  <option value="Other">Other</option>
</select></td></tr>
<tr><td>Product Name/Keyword</td></tr><tr><td><input type="text" name="productname" placeholder='e.g. Beras'></td></tr>
<tr><td>Country</td></tr><tr><td><input type="text" name="country" placeholder='e.g. Malaysia'></td></tr>
<tr><td>Specific Location</td></tr><tr><td><input type="text" name="specificlocation" placeholder='e.g. Serdang'></td></tr>
<tr><td></td></tr><tr><td><input type="submit" name="submit" value="click to help!" class="helpbutton"></td>
</form></tr>
<tr><td></td></tr><tr><td><a href="deleteform.php" class="link">Delete your previous help</a></td></tr>

</table>

</div>
<div align="center">
<br><br>
<!-- centre pointoooooooooooooooooooooooooooooooooooooooo -->
</div>
<div align="center">
<table class="fontbeneficiary">
<tr><form name="form" action="gethelpload.php" method="post">
<tr><td>Who need help?</td></tr><tr><td><input type="text" name="beneficiary" placeholder="e.g. Azli"></td></tr>
<tr><td>Product Type</td></tr><tr><td><select name="producttype">
  <option value="Food">Food</option>
  <option value="Cloth">Cloth</option>
  <option value="Home-Shelter">Home-Shelter</option>
  <option value="Other">Other</option>
</select></td></tr>
<tr><td>Product Name/Keyword</td></tr><tr><td><input type="text" name="productname" placeholder="e.g. Beras"></td></tr>
<tr><td></td></tr><tr><td><input type="submit" name="submit" value="click to search help!" class="helpbutton"></td>
</form></tr>

</table>

</div>
<style>
.fonthelper{font-family:Arial; font-weight:bold;text-align:center;text-decoration:none;}
.fontbeneficiary{font-family:Arial; font-weight:bold; text-align:center;}

.link{text-decoration:none; font-family:Arial;}
.link:hover {color: hotpink;}
.helpbutton{
  text-decoration:none;
  border-radius: 3px 3px 3px 3px;
  border:none;
  background: #1e90ff; 
  width: 95%;
  position: relative;
  z-index: 10;
  font-family: 'times new roman';
  color: white;
  src: url('/iwov-resources/fonts/icomoon.woff?al0qhh') format('woff');
    font-style: normal;
 font-weight: bold;
}
.font-face {
  font-family: 'icomoon';
  src: url('/iwov-resources/fonts/icomoon.woff?al0qhh') format('woff');
  font-weight: normal;
  font-style: normal;
}


input[type=text] {
  width: 100%;
	
  padding: 12px 20px;
  margin: 8px 0;
  box-sizing: border-box;
border-radius:24px;
border-color:blue;
text-decoration: none;
text-align:center;
}

select{
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  border-radius:24px;
  text-align:center;
  border-color:blue;
  box-sizing: border-box;


}
table {
  border: 1px solid black;
  border-radius: 24px;
border:none;
}

</style>
</body>
</html>

