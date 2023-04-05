        /* binnacle*/
CREATE TABLE binnacle (
    table_name VARCHAR(30) NOT NULL COMMENT 'Nombre de la tabla',
    field_ VARCHAR(30) COMMENT 'Cambo que se modifico',
    previous_value VARCHAR(100) COMMENT 'Valor previo',
    new_value_ VARCHAR(100) COMMENT 'Nuevo valor',
    id_binnacle INT NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador de la binnacle (PK)',
    date_of_modification DATETIME COMMENT 'Fecha de mofificación de la tabla',
    date_of_creation DATETIME COMMENT 'Fecha en que se creo la tabla',
    creation_user VARCHAR(50) COMMENT 'Usuario que creo la tabla',
    last_user_modification VARCHAR(50) COMMENT 'Ultimo usuario que modifico la tabla',
	action_ VARCHAR(50) NOT NULL COMMENT 'Acción realizada'
)  TABLESPACE = ge_data;