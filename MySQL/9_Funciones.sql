DELIMITER // 
CREATE PROCEDURE insertNewUser(
        tIDUsers INT, tName VARCHAR(50), tLastName VARCHAR(50), 
        tPassword VARCHAR(250), tUserType ENUM('admin', 'user'), tBirthday DATE)
	BEGIN
		    INSERT INTO users(id_users, name_, last_name, password_, userType, birthday)
                VALUES (tIDUsers, tName, tLastName, SHA1(tPassword), tUserType, tBirthday);
END// 
DELIMITER ;

DELIMITER //
CREATE PROCEDURE updatePassword(
        IN tIDUsers INT, 
        IN tCurrentPassword VARCHAR(250), 
        IN tNewPassword VARCHAR(250))
    BEGIN
        IF checkPassword(tIDUsers, tCurrentPassword) THEN
            UPDATE users
            SET password_ = SHA1(tNewPassword)
            WHERE id_users = tIDUsers;
            
            SELECT CONCAT(1) AS message;
        ELSE
            SELECT CONCAT(0) AS message;
        END IF;
    END//
DELIMITER ;
