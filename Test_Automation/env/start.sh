#!/bin/bash
mkdir -p /run/mysqld && chown mysql:mysql /run/mysqld
mysqld_safe --sql-mode="NO_ZERO_IN_DATE,NO_ENGINE_SUBSTITUTION" >/dev/null 2>&1 &
for i in $(seq 1 60); do mysqladmin ping --silent 2>/dev/null && break; sleep 1; done
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD(''); CREATE DATABASE IF NOT EXISTS donationdb; USE donationdb; CREATE TABLE IF NOT EXISTS helpinfo (helpername VARCHAR(50), phoneno VARCHAR(50), producttype VARCHAR(50), productname VARCHAR(50), onetimeno VARCHAR(50), date VARCHAR(20), time VARCHAR(20), country VARCHAR(50), specificlocation VARCHAR(50));"
exec apache2-foreground
