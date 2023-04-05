/* Se ejecuta en GE */
/* users */
CREATE TABLE users(
    id_users INT NOT NULL PRIMARY KEY COMMENT 'Cédula del usuario (PK)',
    name_ VARCHAR(50) NOT NULL COMMENT 'Nombre del usuario',
    last_name VARCHAR(50) NOT NULL COMMENT 'Apellido del usuario',
    password_ VARCHAR(250) NOT NULL  COMMENT 'Contraseña del usuario',
    userType ENUM('admin', 'user') NOT NULL COMMENT 'Tipo de usuario: admin o user',
    birthday DATE NOT NULL COMMENT 'Fecha de nacimiento del usuario',
    CONSTRAINT unique_id_users UNIQUE (id_users)
) TABLESPACE ge_data;
