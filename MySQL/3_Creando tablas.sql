/* Se ejecuta en GE */
        /* users */
CREATE TABLE users(
    id_users INT NOT NULL PRIMARY KEY 
        USING INDEX (CREATE UNIQUE INDEX id_users ON users (id_users) TABLESPACE ge_ind),
    name_ VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    password_ VARCHAR(250) NOT NULL,
    userType ENUM('admin', 'user') NOT NULL,
    birthday DATE NOT NULL
) TABLESPACE ge_data;
