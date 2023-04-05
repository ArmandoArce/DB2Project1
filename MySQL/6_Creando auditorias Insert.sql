        /* Users Insert */
CREATE TRIGGER usersBeforeInsert BEFORE INSERT ON users
    FOR EACH ROW 
    INSERT ge.binnacle(table_name, action_, creation_user, date_of_creation)
        VALUES('PERSON', 'insert', USER(), CURRENT_TIMESTAMP);
        