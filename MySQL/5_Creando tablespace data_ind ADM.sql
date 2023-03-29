/* Se ejecuta en adm */
CREATE TABLESPACE adm_data
   DATAFILE 'C:\app\alberto\oradata\DB2\admdata01.dbf'
   SIZE 10M
   REUSE
   AUTOEXTEND ON
   NEXT 512k
   MAXSIZE 200M;
   
CREATE TABLESPACE adm_ind
   DATAFILE 'C:\app\alberto\oradata\DB2\admind01.dbf'
   SIZE 10M
   REUSE
   AUTOEXTEND ON
   NEXT 512k
   MAXSIZE 200M;