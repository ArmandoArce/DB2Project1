## Data Hive

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

