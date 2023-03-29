/* Se ejecuta en adm */
/* Creando Secuencias */
CREATE SEQUENCE sec_binnacle start with 0 minvalue 0 increment by 1;
CREATE SEQUENCE sec_binnacleEvaluation start with 0 minvalue 0 increment by 1;
  
GRANT SELECT ON sec_binnacle TO ge;  -- le damos el permiso a ge, de acceder a la secuencia de la bitacora
GRANT SELECT ON sec_binnacleEvaluation TO ge;  -- le damos el permiso a ge, de acceder a la secuencia de la bitacora evaluation

/* Creando tablas */
        /* Binnacle*/
CREATE TABLE binnacle (
    table_name VARCHAR2(30) NOT NULL,
    field_ VARCHAR2(30),
    previous_value VARCHAR2(100),
    new_value_ VARCHAR2(100),
    id_BINNACLE NUMBER NOT NULL PRIMARY KEY 
        USING INDEX (CREATE UNIQUE INDEX id_BINNACLE ON binnacle(id_BINNACLE) TABLESPACE adm_ind),
    date_of_modification VARCHAR2(10),
    date_of_creation VARCHAR2(10),
    creation_user VARCHAR2(20),
    last_user_modification VARCHAR2(20),
	isInsert VARCHAR(3) CHECK (LOWER(isInsert) = 'yes' or LOWER(isInsert) = 'no') NOT NULL
)  TABLESPACE ADM_data;


/* Comentarios de las columnas*/
        /* Binnacle */
COMMENT ON COLUMN binnacle.table_name IS 'Nombre de la tabla';
COMMENT ON COLUMN binnacle.field_ IS 'Cambo que se modifico';
COMMENT ON COLUMN binnacle.previous_value IS 'Valor previo';
COMMENT ON COLUMN binnacle.new_value_ IS 'Nuevo valor';
COMMENT ON COLUMN binnacle.id_BINNACLE IS 'Identificador de la binnacle (PK)';
COMMENT ON COLUMN binnacle.date_of_modification IS 'Fecha de mofificación';
COMMENT ON COLUMN binnacle.date_of_creation IS 'Fecha en que se creo la tabla';
COMMENT ON COLUMN binnacle.creation_user IS 'Usuario que creo la tabla';
COMMENT ON COLUMN binnacle.last_user_modification IS 'Ultimo usuario que modifico la tabla';
COMMENT ON COLUMN binnacle.isInsert IS 'Indica si es insert';

