/* Se ejecuta en ge */
		/* Users Update*/ 
CREATE OR REPLACE TRIGGER beforeUpdateUsers
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW BEGIN
		IF UPDATING ('NAME_') THEN 
			INSERT INTO adm.binnacle(
				id_BINNACLE, 
				table_name, 
				field_, 
				previous_value, 
				new_value_, 
				last_user_modification, 
				date_of_modification,
				isInsert
			)
			VALUES (
				adm.sec_binnacle.NEXTVAL, 
				'USERS', 
				'NAME_',
				:OLD.name_, 
				:NEW.name_, 
				USER, 
				SYSDATE,
				'no'
			);
		END IF;
		IF UPDATING ('LAST_NAME') THEN 
			INSERT INTO adm.binnacle(
				id_BINNACLE, 
				table_name, 
				field_, 
				previous_value, 
				new_value_, 
				last_user_modification, 
				date_of_modification,
				isInsert
			)
			VALUES (
				adm.sec_binnacle.NEXTVAL, 
				'USERS', 
				'LAST_NAME',
				:OLD.last_name, 
				:NEW.last_name, 
				USER, 
				SYSDATE,
				'no'
			);
		END IF;
		IF UPDATING ('PASSWORD_') THEN 
			INSERT INTO adm.binnacle(
				id_BINNACLE, 
				table_name, 
				field_, 
				previous_value, 
				new_value_, 
				last_user_modification, 
				date_of_modification,
				isInsert
			)
			VALUES (
				adm.sec_binnacle.NEXTVAL, 
				'USERS', 
				'PASSWORD_',
				:OLD.password_, 
				:NEW.password_, 
				USER, 
				SYSDATE,
				'no'
			);
		END IF;
		IF UPDATING ('USERTYPE') THEN 
			INSERT INTO adm.binnacle(
				id_BINNACLE, 
				table_name, 
				field_, 
				previous_value, 
				new_value_, 
				last_user_modification, 
				date_of_modification,
				isInsert
			)
			VALUES (
				adm.sec_binnacle.NEXTVAL, 
				'USERS', 
				'USERTYPE',
				:OLD.usertype, 
				:NEW.usertype, 
				USER, 
				SYSDATE,
				'no'
			);
		END IF;
    END beforeUpdateUsers;
/