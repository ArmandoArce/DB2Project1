
# Data Hive

## Descripción

Data Hive es una aplicación web que permite a los usuarios subir, descargar y comentar datasets. Además, los usuarios pueden enviar mensajes a otros usuarios y votar por los datasets que les parezcan más interesantes.

## Funcionalidades

-   Registro e inicio de sesión de usuarios
-   Subida de datasets por parte de los usuarios
-   Descarga de datasets por parte de los usuarios
-   Comentarios de los usuarios sobre los datasets
-   Mensajes privados entre usuarios
-   Votación de los datasets
-   Edición o actualización de los datos de mi perfil.
-   Clonación de datasets.

## Tecnologías utilizadas

-   Node.js
-   NPM
-   MySQL
-   OrientDB
-   MongoDB
-   Neo4j
-   HTML
-   CSS
-   JavaScript

## Requerimientos del sistema

-   Node.js 12 o superior
-   MySQL 8 o superior
-   OrientDB 3 o superior
-   MongoDB Atlas
-   Neo4j Aura
-   NPM 6 o superior

## Instrucciones de instalación

1.  Clonar el repositorio: `https://github.com/ArmandoArce/DB2Project1.git`
2.  Instalar las dependencias: `npm install`
3.  Configurar las bases de datos.
    -   Crear una base de datos MySQL y ejecutar los scripts titulados --MYSQL que se ubican en el archivo `script.txt` ubicado en la raíz de la carpeta del repositorio.
    -   Crear una base de datos OrientDB y ejecutar los script titulados --ORIENTDB en el archivo `script.txt` ubicado en la raíz de la carpeta del repositorio.
    -   Configurar una base de datos MongoDB y Neo4j en la nube y obtener las credenciales necesarias para conectarse a ellas mediante Nodejs.
4.  Agregar las credenciales de conexión de cada base de datos en el archivo `index.js`.
5.  Ejecutar el comando: `npm start`

## Instrucciones de uso

Para conocer detalladamente las instrucciones de uso puede acceder al manual del usuario ubicado en la raíz de la carpeta de este repositorio.
