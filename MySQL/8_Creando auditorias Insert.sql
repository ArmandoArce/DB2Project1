/* Se ejecuta en ge */
        /* Users Insert */
CREATE OR REPLACE TRIGGER beforeInsertUsers
    BEFORE INSERT ON USERS
    FOR EACH ROW BEGIN 
		INSERT INTO adm.binnacle (
			id_BINNACLE, 
			table_name, 
			isInsert, 
			creation_user, 
			date_of_creation
		) VALUES (
			adm.sec_binnacle.NEXTVAL,
			'USERS',
			'yes',
			USER,
			SYSDATE
		);
       END beforeInsertUsers;
/