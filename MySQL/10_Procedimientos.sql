/* checkPassword
	Entrada:
		-idToCheck INT = identificador de la persona por verificar
        -passwordToCheck VARCHAR(50) = la contraseña por verificar
    Salida:
        -1 si la contraseña es correcta
        -0 en caso de no existir un usuario o de ser incorrecta la contraseña
*/
DELIMITER // 
CREATE FUNCTION checkPassword(idToCheck INT, passwordToCheck VARCHAR(50)) RETURNS INT
	BEGIN
		DECLARE returnValue INT;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET returnValue = 0;
        SELECT id_users INTO returnValue FROM users WHERE id_users = idToCheck AND password_ = SHA1(passwordToCheck);
        
        IF (returnValue != 0) THEN RETURN 1; END IF;
        RETURN returnValue;
END // 
DELIMITER ;

/* getUserType
	Entrada:
		-idToCheck INT = identificador de la persona por verificar
    Salida:
        -Tipo de usuario
        -NULL En caso de no existir un usuario con id idToCheck 
*/
DELIMITER // 
CREATE FUNCTION getUserType(idToCheck INT) RETURNS VARCHAR(5)
	BEGIN
		DECLARE returnValue VARCHAR(5);
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET returnValue = 'NULL';
        SELECT userType 
			INTO returnValue 
            FROM users 
            WHERE id_users = idToCheck;
        RETURN returnValue;
	END // 
DELIMITER ;


/* isAdmin
	Entrada:
		-idToCheck INT = identificador de la persona por verificar
    Salida:
        1 si es admin
        0 en caso de no existir un usuario con id idToCheck o de no ser admin
    */
DELIMITER // 
CREATE FUNCTION isAdmin(idToCheck INT) RETURNS INT
	BEGIN
		DECLARE returnValue INT;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET returnValue = 0;
        SELECT userType 
			INTO returnValue 
            FROM users 
            WHERE id_users = idToCheck and userType = 'admin';
        RETURN returnValue;
	END // 
DELIMITER ;

/* isUser
	Entrada:
		-idToCheck INT = identificador de la persona por verificar
    Salida:
        1 si es user
        0 en caso de no existir un usuario con id idToCheck o de no ser admin
    */
DELIMITER // 
CREATE FUNCTION isUser(idToCheck INT) RETURNS INT
	BEGIN
		DECLARE returnValue INT;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET returnValue = 0;
        SELECT userType 
			INTO returnValue 
            FROM users 
            WHERE id_users = idToCheck and userType = 'user';
        RETURN returnValue;
	END // 
DELIMITER ;