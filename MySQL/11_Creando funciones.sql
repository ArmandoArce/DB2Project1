/* Funcion que retorna 1 si es admin */
CREATE OR REPLACE FUNCTION isAdmin(pcID_Person int) 
    RETURN INT;
    BEGIN
        SELECT userType
        INTO userType_value
        FROM users
        WHERE id_person = pcID_Person AND userType = 'admin';
        RETURN 1;
    EXCEPTION
        WHEN TOO_MANY_ROWS THEN
            DBMS_OUTPUT.PUT_LINE ('Se retorno más de un resultado.');
        WHEN no_data_found THEN
           return 0;
        WHEN others THEN
            DBMS_OUTPUT.PUT_LINE ('Sucedió un error inesperado');
END;
/

/* Funcion que retorna 1 si es user */
CREATE OR REPLACE FUNCTION isUser(pcID_Person int) 
    RETURN INT;
    BEGIN
        SELECT userType
        INTO userType_value
        FROM users
        WHERE id_person = pcID_Person AND userType = 'user';
        RETURN 1;
        
    EXCEPTION
        WHEN TOO_MANY_ROWS THEN
            DBMS_OUTPUT.PUT_LINE ('Se retorno más de un resultado.');
        WHEN no_data_found THEN
           return 0;
        WHEN others THEN
            DBMS_OUTPUT.PUT_LINE ('Sucedió un error inesperado');
END;
/

/* Funcion que retorna el userType dado por el id de del usuario */
CREATE OR REPLACE FUNCTION getUserType(pcID_Person int) 
    RETURN VARCHAR2;
    userType_value VARCHAR2(20);
    BEGIN
        SELECT userType
        INTO userType_value
        FROM users
        WHERE id_person = pcID_Person;
        RETURN userType_value;
    EXCEPTION
        WHEN TOO_MANY_ROWS THEN
            DBMS_OUTPUT.PUT_LINE ('Se retornó más de un resultado.');
            RETURN null;
        WHEN NO_DATA_FOUND THEN
           RETURN null;
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE ('Sucedió un error inesperado');
            RETURN null;
END;
/