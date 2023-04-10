
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


## English Documentation

## Description

Data Hive is a web application that allows users to upload, download and comment on datasets. In addition, users can send messages to other users and vote for the datasets they find most interesting.

## Functionalities

- User registration and login
- Uploading of datasets by users
- Download of datasets by users
- User comments on datasets
- Private messages between users
- Voting on datasets
- Editing or updating my profile data.
- Cloning of datasets.

## Technologies used

- Node.js
- NPM
- MySQL
- OrientDB
- MongoDB
- Neo4j
- HTML
- CSS
- JavaScript

## System requirements

- Node.js 12 or higher
- MySQL 8 or higher
- OrientDB 3 or higher
- MongoDB Atlas
- Neo4j Aura
- NPM 6 or higher

## Installation instructions

1. Clone the repository: `https://github.com/ArmandoArce/DB2Project1.git`.
2. Install dependencies: `npm install`.
3.  Set up the databases.
    - Create a MySQL database and run the scripts titled --MYSQL located in the `script.txt` file located in the root of the repository folder.
    - Create an OrientDB database and execute the scripts titled --ORIENTDB in the `script.txt` file located in the root of the repository folder.
    - Set up a MongoDB and Neo4j database in the cloud and obtain the necessary credentials to connect to them using Nodejs.
4.  Add the connection credentials for each database in the `index.js` file.
5.  Execute the command: `npm start`.

## Instructions for use

For detailed usage instructions, you can access the user manual located in the root folder of this repository.
