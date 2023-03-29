/* Se corre en GE */
CREATE TABLESPACE ge_data
   DATAFILE 'C:\app\alberto\oradata\DB2\gedata01.dbf'
   SIZE 10M
   REUSE
   AUTOEXTEND ON
   NEXT 512k
   MAXSIZE 200M;
   
CREATE TABLESPACE ge_ind
   DATAFILE 'C:\app\alberto\oradata\DB2\geind01.dbf'
   SIZE 10M
   REUSE
   AUTOEXTEND ON
   NEXT 512k
   MAXSIZE 200M;