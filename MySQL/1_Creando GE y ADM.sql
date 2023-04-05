/* Alterando root para conexión con VS*/
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '1234';
flush privileges;

/* Creacion de usuario GE */
CREATE USER 'ge'@'localhost' IDENTIFIED BY 'ge';
GRANT DROP, SELECT, INSERT, UPDATE, DELETE, CREATE, INDEX, ALTER, 
	CREATE TEMPORARY TABLES, LOCK TABLES, EXECUTE, CREATE VIEW, SHOW VIEW, 
	CREATE ROUTINE, ALTER ROUTINE, EVENT, TRIGGER, REFERENCES ON db2.*  TO 'ge'@'localhost' ;
GRANT CREATE TABLESPACE ON *.* TO 'ge'@'localhost';