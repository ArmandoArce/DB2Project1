DELIMITER // 
CREATE PROCEDURE insertNewUser(
        tIDUsers INT, tName VARCHAR(50), tLastName VARCHAR(50), 
        tPassword VARCHAR(250), tUserType ENUM('admin', 'user'), tBirthday DATE)
	BEGIN
		    INSERT INTO users(id_users, name_, last_name, password_, userType, birthday)
                VALUES (tIDUsers, tName, tLastName, tPassword, tUserType, tBirthday);
END// 
DELIMITER ;
