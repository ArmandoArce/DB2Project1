		/* Users Update*/ DELIMITER //
CREATE TRIGGER usersBeforeUpdate BEFORE UPDATE ON users FOR EACH ROW BEGIN
	IF (NEW.NAME_ != OLD.NAME_) THEN
		INSERT INTO ge.binnacle(
			table_name, field_, previous_value, new_value_, last_user_modification, date_of_modification, action_)
		VALUES (
			'USERS', 'NAME_', OLD.NAME_, NEW.NAME_, USER(), CURRENT_TIMESTAMP, 'update');
	END IF;
	IF (NEW.LAST_NAME != OLD.LAST_NAME) THEN
		INSERT INTO ge.binnacle(
			table_name, field_, previous_value, new_value_, last_user_modification, date_of_modification, action_)
		VALUES (
			'USERS', 'LAST_NAME', OLD.LAST_NAME, NEW.LAST_NAME, USER(), CURRENT_TIMESTAMP, 'update');
	END IF;
	IF (NEW.PASSWORD_ != OLD.PASSWORD_) THEN
		INSERT INTO ge.binnacle(
			table_name, field_, previous_value, new_value_, last_user_modification, date_of_modification, action_)
		VALUES (
			'USERS', 'PASSWORD_', OLD.PASSWORD_, NEW.PASSWORD_, USER(), CURRENT_TIMESTAMP, 'update');
	END IF;
	IF (NEW.USERTYPE != OLD.USERTYPE) THEN
		INSERT INTO ge.binnacle(
			table_name, field_, previous_value, new_value_, last_user_modification, date_of_modification, action_)
		VALUES (
			'USERS', 'USERTYPE', OLD.USERTYPE, NEW.USERTYPE, USER(), CURRENT_TIMESTAMP, 'update');
	END IF;
	IF (NEW.BIRTHDAY != OLD.BIRTHDAY) THEN
		INSERT INTO ge.binnacle(
			table_name, field_, previous_value, new_value_, last_user_modification, date_of_modification, action_)
		VALUES (
			'USERS', 'BIRTHDAY', OLD.BIRTHDAY, NEW.BIRTHDAY, USER(), CURRENT_TIMESTAMP, 'update');
	END IF;
END;// DELIMITER ;