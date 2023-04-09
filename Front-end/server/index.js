/*
 * File Upload and Download API using OrientDB
 *
 * This code implements a file upload and download API using OrientDB, a graph database.
 * It uses Express.js, Multer middleware for handling file uploads, and Adm-zip for zip file operations.
 * Uploaded files are stored as vertices in an OrientDB database with base64-encoded file data.
 * The API supports uploading multiple files at once and associating them with a file container vertex.
 * It also allows downloading individual files and all files from a file container as a zip file.
 *
 * Dependencies:
 * - orientjs: Official orientdb driver for nodejs.
 * - Express: Express is a web application framework used for handling HTTP requests and responses.
 * - Multer: Multer is a middleware used for handling file uploads.
 * - fs: fs is a Node.js module used for interacting with the file system.
 * - os: os is a Node.js module used for interacting with the operating system.
 * - path: path is a Node.js module used for working with file paths.
 * - Adm-zip: Adm-zip is a module used for handling zip files.
 */

// Import dependencies
var OrientDB = require('orientjs');
var express = require('express');
const multer = require('multer');
var fs = require('fs');
const os = require('os');
const path = require('path');
const AdmZip = require('adm-zip');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var currentLoggedInUser = 0;
var newlyCreatedUser = 0;
const neo4j = require('neo4j-driver');
const morgan = require('morgan');



const uri = 'neo4j+s://1e5c4003.databases.neo4j.io';
const user = 'neo4j';
const password = 'JdQ1_Ikd2Gq6z0U65kXsz0FCArU5SWFrzp2bQHLgf8I';

var driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

async function neoWriter (query) {
  const driverW = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const sessionW = driver.session();
  try {
    const result = await sessionW.writeTransaction(tx => tx.run(query));
    await sessionW.close();
    await driverW.close();
    return result.summary.counters; 
  } finally {
  }
}

async function neoReader(query, value_r) {
  driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session();
  try {
    const result = await session.run(query);
    return result.records.map(record => {
      const node = record.get(value_r);
      const properties = {};
      for (const prop in node.properties) {
        const val = node.properties[prop];
        if (val instanceof neo4j.types.Integer) {
          properties[prop] = val.low + val.high * Math.pow(2, 32);
        } else {
          properties[prop] = val;
        }
      }
      return properties.id_user; // Extract only the id_user property
    });
  } finally {
    await session.close();
  }
}

async function addFile(id_file) {
  try {
    const query = `MERGE (:File {id_file: "${id_file}"})`;
    const result = await neoWriter (query);
    console.log(result);
  } catch (error) {
    console.error(error);
  } 
}

async function addUser(id_user) {
  try {
    const query = `MERGE (:User {id_user: ${id_user}})`;
    const result = await neoWriter (query);
    console.log(result);
  } catch (error) {
    console.error(error);
  } 
}

async function addComment(id_comment) {
  try {
    const query = `MERGE (:Comment {id_comment: ${id_comment}})`;
    const result = await neoWriter (query);
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    await driver.close();
  }
}

async function upLog(id_user, id_file) {
  try {
    const query = `MATCH (u:User {id_user: ${id_user}}), (f:File {id_file: "${id_file}"}) MERGE (u)-[:cargo]->(f)`;
    const result = await neoWriter (query);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

async function downLog(id_user, id_file) {
  try {
    const query = `MATCH (u:User {id_user: ${id_user}}), (f1:File {id_file: "${id_file}"}) MERGE (u)-[:descargo]->(f1)`;
    const result = await neoWriter (query);
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    await driver.close();
  }
}

async function postLog(id_user, id_comment) {
  try {
    const query = `MATCH (u:User {id_user: ${id_user}}), (c1:Comment {id_comment: ${id_comment}}) MERGE (u)-[:realizo]->(c1)`;
    const result = await neoWriter (query);
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    await driver.close();
  }
}

async function checkDownloaders(id_file) {
  try {
    const query = `MATCH (u:User)-[:descargo]->(f:File {id_file: "${id_file}"}) RETURN u`;
    const result = await neoReader(query, 'u');
    return result; // Return the result
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function checkFilesByOwner(id_user) {
  try {
    const query = `MATCH (u:User {id_user: ${id_user}})-[:cargo]->(f:File) RETURN f`;
    const result = await neoReader(query, 'f');
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    await driver.close();
  }
}

async function checkCommentsByOwner(id_user) {
  try {
    const query = `MATCH (u:User {id_user: ${id_user}})-[:realizo]->(c:Comment) RETURN c`;
    const result = await neoReader(query, 'c');
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    await driver.close();
  }
}

// Create OrientDB server connection
var server = OrientDB({
  host:     'localhost',
  port:     2424,
  username: 'root',
  password: '1234',
  useToken: true
});

// Use OrientDB server to connect to a specific database
var db = server.use({
   name: 'Project1',
   username: 'admin',
   password: '1234'
});

// Create Express app
var app = express();

// Add this middleware to enable CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


// Configure Multer middleware for file upload
const storage = multer.memoryStorage();

// Create a multer middleware instance with the appropriate settings
const upload = multer();

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '../public')));

// Definir la ruta para devolver el HTML que deseas cargar en el otro HTML
app.get('/ruta/para/tu/codigo/de/nodejs', function(req, res) {
  res.sendFile(path.join(__dirname, '../public/html/contenido.html'));
});

/*
 * Endpoint for files upload
 *
 * This endpoint handles file uploads. It uses Multer middleware to process the uploaded files.
 * It creates vertices in the OrientDB database for each uploaded file, and also creates edges
 * between the files and a file container vertex to associate the files with the container.
 * Once the files and file container are created, it sends a success response to the client.
 * 
 */
app.post('/upload', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'files' }]), async function(req, res) {
  const avatarFile = req.files['avatar'][0];
  let files = req.files['files'];
  const promises = [];

  // Create fileAvatarVertex vertex
  const fileAvatarVertex = await db.create('VERTEX', 'File')
    .set({
      Data: avatarFile.buffer.toString('base64'),
      Name: Buffer.from(avatarFile.originalname, 'latin1').toString('utf8'),
      MimeType: avatarFile.mimetype,
      Size: avatarFile.size
    }).one();
  console.log('Created File Vertex: ' + fileAvatarVertex.Name);

  // Create FileContainer vertex
  let totalSize;
  if (files && files.length > 0) {
    totalSize = files.reduce((acc, file) => acc + file.size, 0);
  } else {
    totalSize = 0;
  }
  const fileContainerVertex = await db.create('VERTEX', 'FileContainer')
    .set({
      Name: req.body.name,
      Description: req.body.description,
      Size: totalSize,
      Date: new Date(),
      OwnerId: currentLoggedInUser,
      TotalVotes: 0
    }).one();
  console.log('Created FileContainer Vertex: ' + fileContainerVertex.Name);

  // Create edge from Avatar to FileContainer
  const isContained = await db.create('EDGE', 'Avatar')
    .from(fileAvatarVertex['@rid'])
    .to(fileContainerVertex['@rid'])
    .one();
  console.log('Created Avatar Edge between fileAvatarVertex and FileContainer');

  // Create File vertices
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const currentFileVertex = await db.create('VERTEX', 'File')
        .set({
          Data: file.buffer.toString('base64'),
          Name: Buffer.from(file.originalname, 'latin1').toString('utf8'),
          MimeType: file.mimetype,
          Size: file.size
        }).one();
      console.log('Created File Vertex: ' + currentFileVertex.Name);

      // Create edge from FileContainer to File
      const has = await db.create('EDGE', 'Files')
        .from(fileContainerVertex['@rid'])
        .to(currentFileVertex['@rid'])
        .one();
      console.log('Created Files Edge between FileContainer and File');
    }
  }

  // Generate notification for the followers of IdUploader
  const datasetName = req.body.name; // Get the dataset name from the request body
  const datasetRid = fileContainerVertex['@rid']; // Get the RID of the dataset (assuming it's stored in a variable called fileContainerVertex)
  createNotificationForFollowers(currentLoggedInUser, datasetName, datasetRid);
  // Wait for all Promises to resolve before calling upLog
  Promise.all([addUser(currentLoggedInUser), addFile(datasetRid.toString().substring(1))])
    .then(() => {
      upLog(currentLoggedInUser, datasetRid.toString().substring(1));
      res.send('Files uploaded successfully');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Internal Server Error');
    });
});

/*
 * Endpoint for file upload
 *
 * This endpoint handles file uploads. It uses Multer middleware to process the uploaded file.
 * It creates a vertex in the OrientDB database for the uploaded file, and sends a success response to the client.
 * 
 */
app.post('/uploadUserAvatar', upload.single('userAvatar'), async function(req, res) {
  const userAvatar = req.file;
  const ownerId = newlyCreatedUser; // replace with actual owner ID

  // Check if UserAvatar vertex with same OwnerId exists
  const existingFileVertex = await db.select()
    .from('UserAvatar')
    .where({
      OwnerId: ownerId
    })
    .one();

  if (existingFileVertex) {
    // Update existing vertex
    const updatedFileVertex = await db.update(existingFileVertex['@rid'])
      .set({
        Data: userAvatar.buffer.toString('base64'),
        Name: Buffer.from(userAvatar.originalname, 'latin1').toString('utf8'),
        MimeType: userAvatar.mimetype,
        Size: userAvatar.size
      }).one();
    console.log('Updated File Vertex: ' + updatedFileVertex.Name);
  } else {
    // Create new vertex
    const newFileVertex = await db.create('VERTEX', 'UserAvatar')
      .set({
        Data: userAvatar.buffer.toString('base64'),
        Name: Buffer.from(userAvatar.originalname, 'latin1').toString('utf8'),
        MimeType: userAvatar.mimetype,
        Size: userAvatar.size,
        OwnerId: ownerId
      }).one();
    console.log('Created File Vertex: ' + newFileVertex.Name);
  }

  res.send('File uploaded successfully');
});

app.post('/editUserAvatar', upload.single('userAvatar'), async function(req, res) {
  const userAvatar = req.file;
  const ownerId = currentLoggedInUser; // replace with actual owner ID
  console.log("hola");
  // Check if UserAvatar vertex with same OwnerId exists
  const existingFileVertex = await db.select()
    .from('UserAvatar')
    .where({
      OwnerId: ownerId
    })
    .one();
  if (existingFileVertex) {
    // Update existing vertex
    const updatedFileVertex = await db.update(existingFileVertex['@rid'])
      .set({
        Data: userAvatar.buffer.toString('base64'),
        Name: Buffer.from(userAvatar.originalname, 'latin1').toString('utf8'),
        MimeType: userAvatar.mimetype,
        Size: userAvatar.size
      }).one();
    console.log('Updated File Vertex: ' + updatedFileVertex.Name);
  } else {
    // Create new vertex
    const newFileVertex = await db.create('VERTEX', 'UserAvatar')
      .set({
        Data: userAvatar.buffer.toString('base64'),
        Name: Buffer.from(userAvatar.originalname, 'latin1').toString('utf8'),
        MimeType: userAvatar.mimetype,
        Size: userAvatar.size,
        OwnerId: ownerId
      }).one();
    console.log('Created File Vertex: ' + newFileVertex.Name);
  }

  res.send('File uploaded successfully');
});

// Route for retrieving user avatar file by OwnerId
app.get('/getUserAvatar', async function(req, res) {
  const ownerId = currentLoggedInUser;

  // Fetch UserAvatar vertex with matching OwnerId
  const userAvatar = await db.query(`SELECT FROM UserAvatar WHERE OwnerId = ${ownerId}`)
    .then(function(result) {
      if (result.length > 0) {
        return result[0];
      } else {
        return null;
      }
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).send('Error retrieving user avatar');
    });

  if (userAvatar) {
    // Fetch user avatar file data
    const avatarData = userAvatar.Data;
    const avatarBuffer = Buffer.from(avatarData, 'base64');
    const avatarMimeType = userAvatar.MimeType;

    // Send user avatar file to client
    res.writeHead(200, {
      'Content-Type': avatarMimeType,
      'Content-Length': avatarBuffer.length
    });
    res.end(avatarBuffer);
  } else {
    res.status(404).send('User avatar not found');
  }
});

/*
 * Endpoint for downloading a file by file ID
 *
 * This endpoint is responsible for retrieving a file from the OrientDB database
 * by file ID, saving it to a local file on the server, and then sending it as
 * a download response to the client. The endpoint takes a file ID as a URL parameter,
 * queries the database to retrieve the corresponding file, and then saves the file
 * data to a local file in the specified downloads directory. Finally, it sets the
 * appropriate content type header and sends the file as a download response to the client.
 * If any errors occur during the process, appropriate error responses are sent to the client.
 * 
 */
app.get('/downloadFile/:fileId', function(req, res) {
    const vertexId = req.params.fileId;
    const recordId = '#' + vertexId; // add the "#" prefix to the record ID
    db.query(`SELECT FROM ${recordId}`)
      .then(function(result) {
        const vertex = result[0];
        const base64Data = vertex.Data;
        const dataBuffer = Buffer.from(base64Data, 'base64');
        const downloadsPath = path.join(os.homedir(), 'Downloads');
        const filepath = path.join(downloadsPath, vertex.Name); // set the path to where you want to download the file
        fs.writeFile(filepath, dataBuffer, function(err) {
          if (err) {
            console.error(err);
            res.status(500).send('Error downloading file');
          } else {
            const contentType = vertex.MimeType;
            const fileContent = fs.readFileSync(filepath);
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${vertex.Name}"`);
            res.send(fileContent);
            fs.unlinkSync(filepath);
          }
        });
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send('Error downloading file');
      });
});  

/* 
 * Endpoint for downloading a dataset by container ID
 * This endpoint allows downloading a file container along with its associated files. 
 * It takes a containerId as a parameter in the URL and fetches the file container record from the 
 * database. It then fetches the file records associated with the container, creates a zip file 
 * containing the container information, avatar file, and all the associated files, and sends 
 * the zip file as a response to be downloaded by the client.
 * 
 */
app.get('/downloadFileContainer/:containerId', function(req, res) {
  const containerId = req.params.containerId;
  const recordId = '#' + containerId; // add the "#" prefix to the record ID

  // Fetch file container record
  db.query(`SELECT FROM ${recordId}`)
    .then(function(resultContainer) {
      const container = resultContainer[0];
      const containerName = container.Name;
      const containerDescription = container.Description;
      const containerOwnerId = container.OwnerId;
      const containerSize = container.Size.toString() + " bytes";
      const containerTotalVotes = container.TotalVotes.toString() + " votes";
      const containerDate = container.Date.toLocaleString(undefined, { timeZone: 'UTC', hour12: false, timeZoneName: 'short' });

      // Fetch file records
      db.query(`SELECT FROM (SELECT expand(out('Files')) FROM ${recordId})`)
        .then(function(resultFiles) {
          const files = resultFiles;
          const promises = [];
          const downloadsPath = path.join(os.homedir(), 'Downloads');
          const zipName = containerName + '.zip';
          const zipPath = path.join(downloadsPath, zipName);
          const zip = new AdmZip();

          // Create a .txt file with file container information
          const containerInfo = `File Container: ${containerName}\nOwner: ${containerOwnerId}\nDescription: ${containerDescription}\nSize: ${containerSize}\nTotal votes: ${containerTotalVotes}\nDate: ${containerDate}`;
          const containerInfoPath = path.join(downloadsPath, 'Dataset Information' + '.txt');
          fs.writeFileSync(containerInfoPath, containerInfo, 'utf-8');
          zip.addLocalFile(containerInfoPath);
          // Delete file after adding to zip
          fs.unlinkSync(containerInfoPath);

          // Fetch avatar file record
          db.query(`SELECT FROM (SELECT expand(in('Avatar')) FROM ${recordId})`)
          .then(function(resultAvatar) {
          const avatar = resultAvatar[0];
          const avatarBase64Data = avatar.Data;
          const avatarDataBuffer = Buffer.from(avatarBase64Data, 'base64');
          const avatarFilename = "Avatar of " + containerName + path.extname(avatar.Name); // set the filename as "Containername.extension"
          const avatarFilepath = path.join(downloadsPath, avatarFilename); // set the path to where you want to download the avatar file
          fs.writeFileSync(avatarFilepath, avatarDataBuffer);
          zip.addLocalFile(avatarFilepath);
          // Delete file after adding to zip
          fs.unlinkSync(avatarFilepath);
          })
          .catch(function(err) {
          console.error(err);
          res.status(500).send('Error downloading Avatar');
          });


          for (let i = 0; i < files.length; i++) {
            const vertexId = files[i]['@rid'];
            const currentFileVertex = db.query(`SELECT FROM ${vertexId}`)
              .then(function(result) {
                const vertex = result[0];
                const base64Data = vertex.Data;
                const dataBuffer = Buffer.from(base64Data, 'base64');
                const filepath = path.join(downloadsPath, vertex.Name); // set the path to where you want to download the file
                fs.writeFileSync(filepath, dataBuffer);
                zip.addLocalFile(filepath);
                // Delete file after adding to zip
                fs.unlinkSync(filepath);
              })
              .catch(function(err) {
                console.error(err);
              });
            promises.push(currentFileVertex);
          }
          Promise.all(promises)
            .then(function() {
              zip.writeZip(zipPath);
              const zipBuffer = fs.readFileSync(zipPath);
              res.setHeader('Content-Type', 'application/zip');
              res.setHeader('Content-Disposition', 'attachment; filename=' + zipName);
              res.send(zipBuffer);
              Promise.all([addUser(currentLoggedInUser), addFile(containerId)])
              .then(() => {
                downLog(currentLoggedInUser, containerId);
              })
              .catch((error) => {
                console.error(error);
              });
              fs.unlinkSync(zipPath);
            })
            .catch(function(err) {
              console.error(err);
              res.status(500).send('Error downloading files');
            });
        })
        .catch(function(err) {
          console.error(err);
          res.status(500).send('Error downloading files');
        });
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).send('Error downloading files');
    });
});

/*
 * Endpoint for handling votes
 *
 * If a "Vote" vertex already exists for the user ID, it will be deleted.
 * Otherwise, a new "Vote" vertex with Value: voteValute and OwnerId: userId will be created. 
 * This endpoint sends success or error responses to the client based on the success or failure 
 * of the various database operations.
 * 
 */
app.get('/vote/:fileContainerId/:voteValue', upload.none(), function(req, res) {
  const fileContainerId = req.params.fileContainerId;
  const recordId = '#' + fileContainerId; // add "#" prefix to FileContainer ID
  const userId = currentLoggedInUser; // get user ID, you can implement logic to obtain it
  // Check if a "Vote" vertex already exists for the user ID and the specific FileContainer
  db.query(`SELECT FROM Vote WHERE OwnerId = ${userId} AND out('Votes').@rid = ${recordId}`)
    .then(function(result) {
      if (result.length > 0) {
        const vote = result[0];
        const voteValue = vote['Value'];
        // First update the FileContainer attribute: TotalVotes
        db.query(`SELECT FROM FileContainer WHERE @rid = ${recordId}`)
          .then(function(result) {
            const totalVotes = result[0]['TotalVotes'];
            const newTotalVotes = totalVotes - voteValue;
            db.update(recordId)
              .set({ TotalVotes: newTotalVotes })
              .one()
              .then(function() {
                // If it exists, delete the vertex
                db.delete('VERTEX', vote['@rid'])
                  .one()
                  .then(function() {
                    res.status(200).send('Vote removed' );
                  })
                  .catch(function(err) {
                    console.error(err);
                    res.status(500).send('Error removing existing vote');
                  });
              });
          });
      } else {
        // If it doesn't exist, create a new "Vote" vertex with Value: voteValue and OwnerId: userId
        db.create('VERTEX', 'Vote')
          .set({
            Value: req.params.voteValue,
            OwnerId: userId
          })
          .one()
          .then(function(newVote) {
            const saveVote = newVote;
            // First update the FileContainer attribute: TotalVotes
            db.query(`SELECT FROM FileContainer WHERE @rid = ${recordId}`)
              .then(function(result) {
                const totalVotes = result[0]['TotalVotes'];
                const newTotalVotes = totalVotes + parseInt(req.params.voteValue);
                db.update(recordId)
                  .set({ TotalVotes: newTotalVotes })
                  .one()
                  .then(function() {
                    // Create a new "Votes" edge between the "Vote" vertex and the "FileContainer" vertex
                    db.create('EDGE', 'Votes')
                      .from(saveVote['@rid'])
                      .to(recordId)
                      .one()
                      .then(function() {
                        res.status(200).send('Vote registered');
                      })
                      .catch(function(err) {
                        console.error(err);
                        res.status(500).send('Error creating "Votes" edge' );
                      });
                  });
              });
          })
          .catch(function(err) {
            console.error(err);
            res.status(500).send('Error registering vote');
          });
      }
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).send('Error searching for existing vote');
    });
});


app.get('/getContainersByDescription/:containerDescription', upload.none(), function(req, res) {
  containerDescription = req.params.containerDescription;
  // Fetch file container records by description
  db.query(`SELECT FROM FileContainer WHERE Description = '${containerDescription}'`)
  .then(function(result) {
    const fileContainers = result;
    const promises = [];
    for (let i = 0; i < fileContainers.length; i++) {
      const fileContainer = fileContainers[i];
      const recordId = fileContainer['@rid'];

      // Fetch avatar file
      const promiseAvatar = db.query(`SELECT expand(in('Avatar')).@rid FROM ${recordId}`)
      .then(function(resultAvatar) {
        const avatarRid = resultAvatar[0]['@rid'];
        // Fetch avatar file data
        return db.query(`SELECT FROM ${avatarRid}`)
          .then(function(resultAvatarFile) {
            const avatarData = resultAvatarFile[0].Data;
            const avatarBuffer = Buffer.from(avatarData, 'base64');
            const avatarMimeType = resultAvatarFile[0].MimeType;
            // Add avatar image data to file container object
            fileContainer.avatarData = avatarBuffer;
            fileContainer.avatarMimeType = avatarMimeType;
          })
          .catch(function(err) {
            console.error(err);
          });
      })
      .catch(function(err) {
        console.error(err);
      });

      promises.push(promiseAvatar);
    }
    Promise.all(promises)
    .then(function() {
      // Wait for all promises to be resolved
      const ownerPromises = [];
      for (let i = 0; i < fileContainers.length; i++) {
        ownerPromises.push(getUser(fileContainers[i].OwnerId));
      }
      return Promise.all(ownerPromises);
    })
    .then(function(owners) {
      // Build HTML table from file container objects and send to client
      let html = `<h2 class="i-subname">All datasets with the description <p style="color: #EAAA00;">${containerDescription}</p></h2><dir class="board"><table width="100%"><thead><tr><td>Owner</td><td colspan="2" style="text-align: center;">Dataset</td><td>Total Votes</td><td></td><td></td></tr></thead><tbody>`;
      for (let i = 0; i < fileContainers.length; i++) {
        const fileContainer = fileContainers[i];
        const owner = owners[i];
        html += `<tr>
                  <td>
                    <div style="display: inline-block;">
                      <img src="data:${owner.avatarMimeType};base64,${owner.avatarData.toString('base64')}"/>
                      <h5>${owner.UsernameUser}</h5>
                    </div>
                  </td>
                  <td class="dataset">
                  <img src="data:${fileContainer.avatarMimeType};base64,${fileContainer.avatarData.toString('base64')}"/>
                  <div class="dataset-de">
                    <h5>${fileContainer.Name}</h5>
                    <p>${fileContainer.Description}</p>
                  </div>
                  </td>
                  <td class="dataset-des">
                  <h5>${fileContainer.Size} bytes</h5>
                  <p>${new Date(fileContainer.Date).toLocaleString(undefined, { timeZone: 'UTC', hour12: false, timeZoneName: 'short' })}</p>
                  </td>
                  <td class="active"><p>${fileContainer.TotalVotes}</p></td>
                  <td>
                    <div onclick="getRelatedFiles('${fileContainer['@rid'].toString().substring(1)}')" class="edit"><a href="#">Get related Files</a></div>
                  </td>
                  <td>
                    <div onclick="getRelatedVotes('${fileContainer['@rid'].toString().substring(1)}')" class="edit"><a href="#">Get Votes</a></div>       
                  </td>
              </tr>`;
      }
      html += '</tbody></table></dir>';
      // Send the HTML to the client
      res.send(html);
    })
    .catch(function(err) {
      console.error(err);
    });  
  })
  .catch(function(err) {
    console.error(err);
    res.status(500).send('Error retrieving file containers');
  });
});

app.get('/getContainersByDescriptionAndUser/:containerDescription', upload.none(), function(req, res) {
  containerDescription = req.params.containerDescription;
  currentOwnerId = currentLoggedInUser;
  // Fetch file container records by description
  db.query(`SELECT FROM FileContainer WHERE Description = '${containerDescription}' AND OwnerId = '${currentOwnerId}'`)
  .then(function(result) {
    const fileContainers = result;
    const promises = [];
    for (let i = 0; i < fileContainers.length; i++) {
      const fileContainer = fileContainers[i];
      const recordId = fileContainer['@rid'];

      // Fetch avatar file
      const promiseAvatar = db.query(`SELECT expand(in('Avatar')).@rid FROM ${recordId}`)
      .then(function(resultAvatar) {
        const avatarRid = resultAvatar[0]['@rid'];
        // Fetch avatar file data
        return db.query(`SELECT FROM ${avatarRid}`)
          .then(function(resultAvatarFile) {
            const avatarData = resultAvatarFile[0].Data;
            const avatarBuffer = Buffer.from(avatarData, 'base64');
            const avatarMimeType = resultAvatarFile[0].MimeType;
            // Add avatar image data to file container object
            fileContainer.avatarData = avatarBuffer;
            fileContainer.avatarMimeType = avatarMimeType;
          })
          .catch(function(err) {
            console.error(err);
          });
      })
      .catch(function(err) {
        console.error(err);
      });

      promises.push(promiseAvatar);
    }
    Promise.all(promises)
    .then(function() {
      // Wait for all promises to be resolved
      const ownerPromises = [];
      for (let i = 0; i < fileContainers.length; i++) {
        ownerPromises.push(getUser(fileContainers[i].OwnerId));
      }
      return Promise.all(ownerPromises);
    })
    .then(function(owners) {
      // Build HTML table from file container objects and send to client
      let html = `<h2 class="i-subname">All datasets with the description <p style="color: #EAAA00;">${containerDescription}</p></h2><dir class="board"><table width="100%"><thead><tr><td>Owner</td><td colspan="2" style="text-align: center;">Dataset</td><td>Total Votes</td><td></td><td></td></tr></thead><tbody>`;
      for (let i = 0; i < fileContainers.length; i++) {
        const fileContainer = fileContainers[i];
        const owner = owners[i];
        html += `<tr>
                  <td>
                    <div style="display: inline-block;">
                      <img src="data:${owner.avatarMimeType};base64,${owner.avatarData.toString('base64')}"/>
                      <h5>${owner.UsernameUser}</h5>
                    </div>
                  </td>
                  <td class="dataset">
                  <img src="data:${fileContainer.avatarMimeType};base64,${fileContainer.avatarData.toString('base64')}"/>
                  <div class="dataset-de">
                    <h5>${fileContainer.Name}</h5>
                    <p>${fileContainer.Description}</p>
                  </div>
                  </td>
                  <td class="dataset-des">
                  <h5>${fileContainer.Size} bytes</h5>
                  <p>${new Date(fileContainer.Date).toLocaleString(undefined, { timeZone: 'UTC', hour12: false, timeZoneName: 'short' })}</p>
                  </td>
                  <td class="active"><p>${fileContainer.TotalVotes}</p></td>
                  <td>
                    <div onclick="getRelatedFiles('${fileContainer['@rid'].toString().substring(1)}')" class="edit"><a href="#">Clones</a></div>
                  </td>
                  <td>
                    <div onclick="getRelatedVotes('${fileContainer['@rid'].toString().substring(1)}')" class="edit"><a href="#">View downloads</a></div>       
                  </td>
              </tr>`;
      }
      html += '</tbody></table></dir>';
      // Send the HTML to the client
      res.send(html);
    })
      .catch(function(err) {
        console.error(err);
        res.status(500).send('Error retrieving file containers');
      });
  })
  .catch(function(err) {
    console.error(err);
    res.status(500).send('Error retrieving file containers');
  });
});

app.get('/getAllContainers', upload.none(), function(req, res) {
  // Fetch all file containers records
  db.query(`SELECT * FROM FileContainer`)
  .then(function(result) {
    const fileContainers = result;
    const promises = [];
    for (let i = 0; i < fileContainers.length; i++) {
      const fileContainer = fileContainers[i];
      const recordId = fileContainer['@rid'];

      // Fetch avatar file
      const promiseAvatar = db.query(`SELECT expand(in('Avatar')).@rid FROM ${recordId}`)
      .then(function(resultAvatar) {
        const avatarRid = resultAvatar[0]['@rid'];
        // Fetch avatar file data
        return db.query(`SELECT FROM ${avatarRid}`)
          .then(function(resultAvatarFile) {
            const avatarData = resultAvatarFile[0].Data;
            const avatarBuffer = Buffer.from(avatarData, 'base64');
            const avatarMimeType = resultAvatarFile[0].MimeType;
            // Add avatar image data to file container object
            fileContainer.avatarData = avatarBuffer;
            fileContainer.avatarMimeType = avatarMimeType;
          })
          .catch(function(err) {
            console.error(err);
          });
      })
      .catch(function(err) {
        console.error(err);
      });

      promises.push(promiseAvatar);
    }
    Promise.all(promises)
    .then(function() {
      // Wait for all promises to be resolved
      const ownerPromises = [];
      for (let i = 0; i < fileContainers.length; i++) {
        ownerPromises.push(getUser(fileContainers[i].OwnerId));
      }
      return Promise.all(ownerPromises);
    })
    .then(function(owners) {
      // Build HTML table from file container objects and send to client
      let html = `<h2 class="i-subname">All datasets</h2><dir class="board"><table width="100%"><thead><tr><td>Owner</td><td colspan="2" style="text-align: center;">Dataset</td><td>Total Votes</td><td></td><td></td></tr></thead><tbody>`;
      for (let i = 0; i < fileContainers.length; i++) {
        const fileContainer = fileContainers[i];
        const owner = owners[i];
        html += `<tr>
                  <td>
                    <div style="display: inline-block;">
                      <img src="data:${owner.avatarMimeType};base64,${owner.avatarData.toString('base64')}"/>
                      <h5>${owner.UsernameUser}</h5>
                    </div>
                  </td>
                  <td class="dataset">
                  <img src="data:${fileContainer.avatarMimeType};base64,${fileContainer.avatarData.toString('base64')}"/>
                  <div class="dataset-de">
                    <h5>${fileContainer.Name}</h5>
                    <p>${fileContainer.Description}</p>
                  </div>
                  </td>
                  <td class="dataset-des">
                  <h5>${fileContainer.Size} bytes</h5>
                  <p>${new Date(fileContainer.Date).toLocaleString(undefined, { timeZone: 'UTC', hour12: false, timeZoneName: 'short' })}</p>
                  </td>
                  <td class="active"><p>${fileContainer.TotalVotes}</p></td>
                  <td>
                    <div onclick="getRelatedFiles('${fileContainer['@rid'].toString().substring(1)}')" class="edit"><a href="#">Get related Files</a></div>
                  </td>
                  <td>
                    <div onclick="getRelatedVotes('${fileContainer['@rid'].toString().substring(1)}')" class="edit"><a href="#">Get Votes</a></div>       
                  </td>
              </tr>`;
      }
      html += '</tbody></table></dir>';
      // Send the HTML to the client
      res.send(html);
    })
      .catch(function(err) {
        console.error(err);
        res.status(500).send('Error retrieving file containers');
      });
  })
  .catch(function(err) {
    console.error(err);
    res.status(500).send('Error retrieving file containers');
  });
});

app.get('/getContainersByName/:containerName', upload.none(), function(req, res) {
  containerName = req.params.containerName;
  // Fetch file container records by name
  db.query(`SELECT FROM FileContainer WHERE Name = '${containerName}'`)
  .then(function(result) {
    const fileContainers = result;
    const promises = [];
    for (let i = 0; i < fileContainers.length; i++) {
      const fileContainer = fileContainers[i];
      const recordId = fileContainer['@rid'];

      // Fetch avatar file
      const promiseAvatar = db.query(`SELECT expand(in('Avatar')).@rid FROM ${recordId}`)
      .then(function(resultAvatar) {
        const avatarRid = resultAvatar[0]['@rid'];
        // Fetch avatar file data
        return db.query(`SELECT FROM ${avatarRid}`)
          .then(function(resultAvatarFile) {
            const avatarData = resultAvatarFile[0].Data;
            const avatarBuffer = Buffer.from(avatarData, 'base64');
            const avatarMimeType = resultAvatarFile[0].MimeType;
            // Add avatar image data to file container object
            fileContainer.avatarData = avatarBuffer;
            fileContainer.avatarMimeType = avatarMimeType;
          })
          .catch(function(err) {
            console.error(err);
          });
      })
      .catch(function(err) {
        console.error(err);
      });

      promises.push(promiseAvatar);
    }
    Promise.all(promises)
    .then(function() {
      // Wait for all promises to be resolved
      const ownerPromises = [];
      for (let i = 0; i < fileContainers.length; i++) {
        ownerPromises.push(getUser(fileContainers[i].OwnerId));
      }
      return Promise.all(ownerPromises);
    })
    .then(function(owners) {
      // Build HTML table from file container objects and send to client
      let html = `<h2 class="i-subname">All datasets with the name <p style="color: #EAAA00;">${containerName}</p></h2><dir class="board"><table width="100%"><thead><tr><td>Owner</td><td colspan="2" style="text-align: center;">Dataset</td><td>Total Votes</td><td></td><td></td></tr></thead><tbody>`;
      for (let i = 0; i < fileContainers.length; i++) {
        const fileContainer = fileContainers[i];
        const owner = owners[i];
        html += `<tr>
                  <td>
                    <div style="display: inline-block;">
                      <img src="data:${owner.avatarMimeType};base64,${owner.avatarData.toString('base64')}"/>
                      <h5>${owner.UsernameUser}</h5>
                    </div>
                  </td>
                  <td class="dataset">
                  <img src="data:${fileContainer.avatarMimeType};base64,${fileContainer.avatarData.toString('base64')}"/>
                  <div class="dataset-de">
                    <h5>${fileContainer.Name}</h5>
                    <p>${fileContainer.Description}</p>
                  </div>
                  </td>
                  <td class="dataset-des">
                  <h5>${fileContainer.Size} bytes</h5>
                  <p>${new Date(fileContainer.Date).toLocaleString(undefined, { timeZone: 'UTC', hour12: false, timeZoneName: 'short' })}</p>
                  </td>
                  <td class="active"><p>${fileContainer.TotalVotes}</p></td>
                  <td>
                    <div onclick="getRelatedFiles('${fileContainer['@rid'].toString().substring(1)}')" class="edit"><a href="#">Get related Files</a></div>
                  </td>
                  <td>
                    <div onclick="getRelatedVotes('${fileContainer['@rid'].toString().substring(1)}')" class="edit"><a href="#">Get Votes</a></div>       
                  </td>
              </tr>`;
      }
      html += '</tbody></table></dir>';
      // Send the HTML to the client
      res.send(html);
    })
      .catch(function(err) {
        console.error(err);
        res.status(500).send('Error retrieving file containers');
      });
  })
  .catch(function(err) {
    console.error(err);
    res.status(500).send('Error retrieving file containers');
  });
});

app.get('/getContainersByNameAndUserId/:containerName', upload.none(), function(req, res) {
  containerName = req.params.containerName;
  currentOwnerId = currentLoggedInUser;
  // Fetch file container records by name
  db.query(`SELECT FROM FileContainer WHERE Name = '${containerName}' AND OwnerId = '${currentOwnerId}'`)
  .then(function(result) {
    const fileContainers = result;
    const promises = [];
    for (let i = 0; i < fileContainers.length; i++) {
      const fileContainer = fileContainers[i];
      const recordId = fileContainer['@rid'];

      // Fetch avatar file
      const promiseAvatar = db.query(`SELECT expand(in('Avatar')).@rid FROM ${recordId}`)
      .then(function(resultAvatar) {
        const avatarRid = resultAvatar[0]['@rid'];
        // Fetch avatar file data
        return db.query(`SELECT FROM ${avatarRid}`)
          .then(function(resultAvatarFile) {
            const avatarData = resultAvatarFile[0].Data;
            const avatarBuffer = Buffer.from(avatarData, 'base64');
            const avatarMimeType = resultAvatarFile[0].MimeType;
            // Add avatar image data to file container object
            fileContainer.avatarData = avatarBuffer;
            fileContainer.avatarMimeType = avatarMimeType;
          })
          .catch(function(err) {
            console.error(err);
          });
      })
      .catch(function(err) {
        console.error(err);
      });

      promises.push(promiseAvatar);
    }
    Promise.all(promises)
    .then(function() {
      // Wait for all promises to be resolved
      const ownerPromises = [];
      for (let i = 0; i < fileContainers.length; i++) {
        ownerPromises.push(getUser(fileContainers[i].OwnerId));
      }
      return Promise.all(ownerPromises);
    })
    .then(function(owners) {
      // Build HTML table from file container objects and send to client
      let html = `<h2 class="i-subname">All your datasets with the name <p style="color: #EAAA00;">${containerName}</p></h2><dir class="board"><table width="100%"><thead><tr><td>Owner</td><td colspan="2" style="text-align: center;">Dataset</td><td>Total Votes</td><td></td><td></td></tr></thead><tbody>`;
      for (let i = 0; i < fileContainers.length; i++) {
        const fileContainer = fileContainers[i];
        const owner = owners[i];
        html += `<tr>
                  <td>
                    <div style="display: inline-block;">
                      <img src="data:${owner.avatarMimeType};base64,${owner.avatarData.toString('base64')}"/>
                      <h5>${owner.UsernameUser}</h5>
                    </div>
                  </td>
                  <td class="dataset">
                  <img src="data:${fileContainer.avatarMimeType};base64,${fileContainer.avatarData.toString('base64')}"/>
                  <div class="dataset-de">
                    <h5>${fileContainer.Name}</h5>
                    <p>${fileContainer.Description}</p>
                  </div>
                  </td>
                  <td class="dataset-des">
                  <h5>${fileContainer.Size} bytes</h5>
                  <p>${new Date(fileContainer.Date).toLocaleString(undefined, { timeZone: 'UTC', hour12: false, timeZoneName: 'short' })}</p>
                  </td>
                  <td class="active"><p>${fileContainer.TotalVotes}</p></td>
                  <td>
                    <div onclick="getRelatedFiles('${fileContainer['@rid'].toString().substring(1)}')" class="edit"><a href="#">Clones</a></div>
                  </td>
                  <td>
                    <div onclick="getRelatedVotes('${fileContainer['@rid'].toString().substring(1)}')" class="edit"><a href="#">View Downloads</a></div>       
                  </td>
              </tr>`;
      }
      html += '</tbody></table></dir>';
      // Send the HTML to the client
      res.send(html);
    })
      .catch(function(err) {
        console.error(err);
        res.status(500).send('Error retrieving file containers');
      });
  })
  .catch(function(err) {
    console.error(err);
    res.status(500).send('Error retrieving file containers');
  });
});

app.get('/getFilesByContainerRid/:containerRid', upload.none(), async (req, res) => {
  try {
    const containerRid = req.params.containerRid;
    const containerRidFixed = '#' + containerRid; // add "#" prefix to FileContainer ID

    // Fetch file container rid
    const result = await db.query(`SELECT FROM FileContainer WHERE @rid = '${containerRidFixed}'`);
    const fileContainer = result[0];
    const recordId = fileContainer['@rid'];

    // Fetch avatar file
    const resultAvatar = await db.query(`SELECT expand(in('Avatar')).@rid FROM ${recordId}`);
    const avatarRid = resultAvatar[0]['@rid'];

    // Fetch avatar file data
    const resultAvatarFile = await db.query(`SELECT FROM ${avatarRid}`);
    const avatarData = resultAvatarFile[0].Data;
    const avatarBuffer = Buffer.from(avatarData, 'base64');
    const avatarMimeType = resultAvatarFile[0].MimeType;

    // Add avatar image data to file container object
    fileContainer.avatarData = avatarBuffer;
    fileContainer.avatarMimeType = avatarMimeType;

    // Fetch related files @rid
    const resultRelatedFiles = await db.query(`SELECT expand(out('Files')).@rid FROM ${recordId}`);
    const relatedFileRids = resultRelatedFiles.map(function(file) {
      return file['@rid'];
    });

    // Add related file @rids to file container object
    fileContainer.relatedFileRids = relatedFileRids;
    // Build HTML table from file container objects and send to client
    getUser(fileContainer.OwnerId)
    .then(async (owner) => {
      let html = `<input type="hidden" id="currentDataset" value="${containerRid}"><dir class="board"><table width="100%"><thead><tr><td>Owner</td><td colspan="2" style="text-align: center;">Dataset</td><td>Total Votes</td><td></td><td></td></tr></thead><tbody>
      <tr>
        <td>
          <div style="display: inline-block;">
            <img src="data:${owner.avatarMimeType};base64,${owner.avatarData.toString('base64')}"/>
            <h5>${owner.UsernameUser}</h5>
          </div>
        </td>
        <td class="dataset">
        <img src="data:${fileContainer.avatarMimeType};base64,${fileContainer.avatarData.toString('base64')}"/>
        <div class="dataset-de">
          <h5>${fileContainer.Name}</h5>
          <p>${fileContainer.Description}</p>
        </div>
        </td>
        <td class="dataset-des">
        <h5>${fileContainer.Size} bytes</h5>
        <p>${new Date(fileContainer.Date).toLocaleString(undefined, { timeZone: 'UTC', hour12: false, timeZoneName: 'short' })}</p>
        </td>
        <td class="active"><p>${fileContainer.TotalVotes}</p></td>
        <td>
        <td>
          <div onclick="downloadDataset('${containerRid}')" class="edit"><a href="#">Download Dataset</a></div> 
        </td>
      </tr>
      </tbody></table></dir>
      <iframe name="dummyframe" id="dummyframe" style="display: none;"></iframe>
      <form method="get" action="http://localhost:3000/vote/${containerRid}/" onsubmit="this.action += document.getElementById('rating-select').value; fetch(this.action).then(response => response.text()).then(message => { Swal.fire({ title: 'Vote processed!', text: message, icon: 'success' }).then(() => { window.location.href = 'search_datasets.html'; }); }); return false;" target="dummyframe">
      <button type="submit" class="vote-button">Vote</button>
      <div class="rating">
      <select id="rating-select" name="voteValue" required class="form-control">
        <option value="0" selected>0</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
        <option value="7">7</option>
        <option value="8">8</option>
        <option value="9">9</option>
        <option value="10">10</option>
      </select>
      <div class="stars">
        <span class="star" data-value="1" id="star-one"></span>
        <span class="star" data-value="2" id ="star-two"></span>
        <span class="star" data-value="3" id ="star-three"></span>
        <span class="star" data-value="4" id ="star-four"></span>
        <span class="star" data-value="5" id ="star-five"></span>
        <span class="star" data-value="6" id ="star-six"></span>
        <span class="star" data-value="7" id ="star-seven"></span>
        <span class="star" data-value="8" id ="star-eight"></span>
        <span class="star" data-value="9" id ="star-nine"></span>
        <span class="star" data-value="10" id ="star-ten"></span>
      </div>
      </div>
      <script>
        initRatingWidget('star-one');
      </script>
      </form>`;
      html += `<h2 class="i-subname">Dataset Files</h2><dir class="board"><table width="100%"><thead><tr><td>Name</td><td>Size</td><td colspan ="2">MimeType</td></tr></thead><tbody>`;
      for(let j=0; j<fileContainer.relatedFileRids.length; j++){
        // Fetch the related file data
        const relatedFileRid = fileContainer.relatedFileRids[j];
        const resultFile = await db.query(`SELECT FROM ${relatedFileRid}`);
        const file = resultFile[0];
        html += `
        <tr>
          <td>${file.Name}</td>
          <td class="active"><p>${file.Size} bytes</p></td>
          <td class><p>${file.MimeType}</p></td>
          <td>
            <div onclick="downloadFile('${relatedFileRid.toString().substring(1)}')" class="edit"><a href="#">Download File</a>
          </td>
        </tr>`;
      }
      html += `</tbody></table></dir>
      <div class="comments-container">
      <div class="comments-section">
        <div id="NewCommentForm">
          <label for="content">New comment:</label>
          <textarea id="NewContent" name="content" class="textarea"></textarea>
          <input type="hidden" id="currentOwner" value="${owner.UsernameUser}">
          <input type="hidden" id="NewMediaFC" name="media[]" multiple #content>
        
          <input type="button" onclick="submitComment()" class="button button-green" value="Comment" />
        </div>
      </div>
    </div>

      <div id="comentarios"></div>
      
      `;
      res.send(html);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error retrieving owner info');
    });

    
  } catch(err) {
    console.error(err);
    res.status(500).send('Error retrieving file containers');
  }
});

app.get('/getVotesByContainerRid/:containerRid', upload.none(), async (req, res) => {
  try {
    const containerRid = req.params.containerRid;
    const containerRidFixed = '#' + containerRid; // add "#" prefix to FileContainer ID

    // Fetch file container rid
    const result = await db.query(`SELECT FROM FileContainer WHERE @rid = '${containerRidFixed}'`);
    const fileContainer = result[0];
    const recordId = fileContainer['@rid'];

    // Fetch avatar file
    const resultAvatar = await db.query(`SELECT expand(in('Avatar')).@rid FROM ${recordId}`);
    const avatarRid = resultAvatar[0]['@rid'];

    // Fetch avatar file data
    const resultAvatarFile = await db.query(`SELECT FROM ${avatarRid}`);
    const avatarData = resultAvatarFile[0].Data;
    const avatarBuffer = Buffer.from(avatarData, 'base64');
    const avatarMimeType = resultAvatarFile[0].MimeType;

    // Add avatar image data to file container object
    fileContainer.avatarData = avatarBuffer;
    fileContainer.avatarMimeType = avatarMimeType;

    // Fetch related votes @rid
    const resultRelatedVotes = await db.query(`SELECT expand(in('Votes')).@rid FROM ${recordId}`);
    const relatedVoteRids = resultRelatedVotes.map(function(vote) {
      return vote['@rid'];
    });

    // Add related vote @rids to file container object
    fileContainer.relatedVoteRids = relatedVoteRids;
    getUser(fileContainer.OwnerId)
    .then(async (owner) => {
      // Build HTML table from file container objects and send to client
      let html = `<dir class="board"><table width="100%"><thead><tr><td>Owner</td><td colspan="2" style="text-align: center;">Dataset</td><td>Total Votes</td><td></td><td></td></tr></thead><tbody>
      <tr>
        <td>
          <div style="display: inline-block;">
            <img src="data:${owner.avatarMimeType};base64,${owner.avatarData.toString('base64')}"/>
            <h5>${owner.UsernameUser}</h5>
          </div>
        </td>
        <td class="dataset">
        <img src="data:${fileContainer.avatarMimeType};base64,${fileContainer.avatarData.toString('base64')}"/>
        <div class="dataset-de">
          <h5>${fileContainer.Name}</h5>
          <p>${fileContainer.Description}</p>
        </div>
        </td>
        <td class="dataset-des">
        <h5>${fileContainer.Size} bytes</h5>
        <p>${new Date(fileContainer.Date).toLocaleString(undefined, { timeZone: 'UTC', hour12: false, timeZoneName: 'short' })}</p>
        </td>
        <td class="active"><p>${fileContainer.TotalVotes}</p></td>
        <td>
      </tr>
      </tbody></table></dir>`;
      html += '<h2 class="i-subname">Dataset Votes</h2> <dir class="board"><table width="100%"><thead><tr><td>Owner</td><td>Vote Value</td></tr></thead><tbody>';
      for(let j=0; j<fileContainer.relatedVoteRids.length; j++){
        // Fetch the related vote data
        const relatedVoteRid = fileContainer.relatedVoteRids[j];
        const resultVote = await db.query(`SELECT FROM ${relatedVoteRid}`);
        const vote = resultVote[0];
        const resultUser = await getUser(vote.OwnerId);
        html += `
        <tr>
        <td class="dataset">
        <img src="data:${resultUser.avatarMimeType};base64,${resultUser.avatarData.toString('base64')}"/>
        <div class="dataset-de">
          <h5>${resultUser.UsernameUser}</h5>
          <p>${resultUser.NameUser}</p>
        </div>
        <td class="active"><p>${vote.Value} points</p></td>
        </tr>`;
 }
 html += '</tbody></table></dir>';
 res.send(html);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error retrieving owner info');
    });
  } catch(err) {
    console.error(err);
    res.status(500).send('Error retrieving file containers');
  }
});

app.get('/getContainersBySpecificUser/:userId', upload.none(), function(req, res) {
  containerOwnerId = req.params.userId;
  // Fetch file container records by userId
  db.query(`SELECT FROM FileContainer WHERE OwnerId = '${containerOwnerId}'`)
  .then(function(result) {
    const fileContainers = result;
    const promises = [];
    for (let i = 0; i < fileContainers.length; i++) {
      const fileContainer = fileContainers[i];
      const recordId = fileContainer['@rid'];

      // Fetch avatar file
      const promiseAvatar = db.query(`SELECT expand(in('Avatar')).@rid FROM ${recordId}`)
      .then(function(resultAvatar) {
        const avatarRid = resultAvatar[0]['@rid'];
        // Fetch avatar file data
        return db.query(`SELECT FROM ${avatarRid}`)
          .then(function(resultAvatarFile) {
            const avatarData = resultAvatarFile[0].Data;
            const avatarBuffer = Buffer.from(avatarData, 'base64');
            const avatarMimeType = resultAvatarFile[0].MimeType;
            // Add avatar image data to file container object
            fileContainer.avatarData = avatarBuffer;
            fileContainer.avatarMimeType = avatarMimeType;
          })
          .catch(function(err) {
            console.error(err);
          });
      })
      .catch(function(err) {
        console.error(err);
      });

      promises.push(promiseAvatar);
    }
    Promise.all(promises)
    .then(function() {
      // Wait for all promises to be resolved
      const ownerPromises = [];
      for (let i = 0; i < fileContainers.length; i++) {
        ownerPromises.push(getUser(fileContainers[i].OwnerId));
      }
      return Promise.all(ownerPromises);
    })
    .then(function(owners) {
      // Build HTML table from file container objects and send to client
      let html = `<h2 class="i-subname">All the datasets of the user <p style="color: #EAAA00;">${owners[0].UsernameUser}</p></h2><dir class="board"><table width="100%"><thead><tr><td>Owner</td><td colspan="2" style="text-align: center;">Dataset</td><td>Total Votes</td><td></td><td></td></tr></thead><tbody>`;
      for (let i = 0; i < fileContainers.length; i++) {
        const fileContainer = fileContainers[i];
        const owner = owners[i];
        html += `<tr>
                  <td>
                    <div style="display: inline-block;">
                      <img src="data:${owner.avatarMimeType};base64,${owner.avatarData.toString('base64')}"/>
                      <h5>${owner.UsernameUser}</h5>
                    </div>
                  </td>
                  <td class="dataset">
                  <img src="data:${fileContainer.avatarMimeType};base64,${fileContainer.avatarData.toString('base64')}"/>
                  <div class="dataset-de">
                    <h5>${fileContainer.Name}</h5>
                    <p>${fileContainer.Description}</p>
                  </div>
                  </td>
                  <td class="dataset-des">
                  <h5>${fileContainer.Size} bytes</h5>
                  <p>${new Date(fileContainer.Date).toLocaleString(undefined, { timeZone: 'UTC', hour12: false, timeZoneName: 'short' })}</p>
                  </td>
                  <td class="active"><p>${fileContainer.TotalVotes}</p></td>
                  <td>
                    <div onclick="getRelatedFiles('${fileContainer['@rid'].toString().substring(1)}')" class="edit"><a href="#">Get related Files</a></div>
                  </td>
                  <td>
                    <div onclick="getRelatedVotes('${fileContainer['@rid'].toString().substring(1)}')" class="edit"><a href="#">Get Votes</a></div>       
                  </td>
              </tr>`;
      }
      html += '</tbody></table></dir>';
      // Send the HTML to the client
      res.send(html);
    })
      .catch(function(err) {
        console.error(err);
        res.status(500).send('Error retrieving file containers');
      });
  })
  .catch(function(err) {
    console.error(err);
    res.status(500).send('Error retrieving file containers');
  });
});

app.get('/getContainersByUser', upload.none(), function(req, res) {
  containerOwnerId = currentLoggedInUser;
  // Fetch file container records by userId
  db.query(`SELECT FROM FileContainer WHERE OwnerId = '${containerOwnerId}'`)
  .then(function(result) {
    const fileContainers = result;
    const promises = [];
    for (let i = 0; i < fileContainers.length; i++) {
      const fileContainer = fileContainers[i];
      const recordId = fileContainer['@rid'];

      // Fetch avatar file
      const promiseAvatar = db.query(`SELECT expand(in('Avatar')).@rid FROM ${recordId}`)
      .then(function(resultAvatar) {
        const avatarRid = resultAvatar[0]['@rid'];
        // Fetch avatar file data
        return db.query(`SELECT FROM ${avatarRid}`)
          .then(function(resultAvatarFile) {
            const avatarData = resultAvatarFile[0].Data;
            const avatarBuffer = Buffer.from(avatarData, 'base64');
            const avatarMimeType = resultAvatarFile[0].MimeType;
            // Add avatar image data to file container object
            fileContainer.avatarData = avatarBuffer;
            fileContainer.avatarMimeType = avatarMimeType;
          })
          .catch(function(err) {
            console.error(err);
          });
      })
      .catch(function(err) {
        console.error(err);
      });

      promises.push(promiseAvatar);
    }
    Promise.all(promises)
    .then(function() {
      // Wait for all promises to be resolved
      const ownerPromises = [];
      for (let i = 0; i < fileContainers.length; i++) {
        ownerPromises.push(getUser(fileContainers[i].OwnerId));
      }
      return Promise.all(ownerPromises);
    })
    .then(function(owners) {
      // Build HTML table from file container objects and send to client
      let html = `<h2 class="i-subname">All yourdatasets</h2><dir class="board"><table width="100%"><thead><tr><td>Owner</td><td colspan="2" style="text-align: center;">Dataset</td><td>Total Votes</td><td></td><td></td></tr></thead><tbody>`;
      for (let i = 0; i < fileContainers.length; i++) {
        const fileContainer = fileContainers[i];
        const owner = owners[i];
        html += `<tr>
                  <td>
                    <div style="display: inline-block;">
                      <img src="data:${owner.avatarMimeType};base64,${owner.avatarData.toString('base64')}"/>
                      <h5>${owner.UsernameUser}</h5>
                    </div>
                  </td>
                  <td class="dataset">
                  <img src="data:${fileContainer.avatarMimeType};base64,${fileContainer.avatarData.toString('base64')}"/>
                  <div class="dataset-de">
                    <h5>${fileContainer.Name}</h5>
                    <p>${fileContainer.Description}</p>
                  </div>
                  </td>
                  <td class="dataset-des">
                  <h5>${fileContainer.Size} bytes</h5>
                  <p>${new Date(fileContainer.Date).toLocaleString(undefined, { timeZone: 'UTC', hour12: false, timeZoneName: 'short' })}</p>
                  </td>
                  <td class="active"><p>${fileContainer.TotalVotes}</p></td>
                  <td>
                    <div onclick="copyDataSetById('${fileContainer['@rid'].toString().substring(1)}')" class="edit"><a href="#">Copy</a></div>
                  </td>
                  <td>
                    <div onclick="getAllDownloads('${fileContainer['@rid'].toString().substring(1)}')" class="edit"><a href="#">View downloads</a></div>       
                  </td>
              </tr>`;
      }
      html += '</tbody></table></dir>';
      // Send the HTML to the client
      res.send(html);
    })
      .catch(function(err) {
        console.error(err);
        res.status(500).send('Error retrieving file containers');
      });
  })
  .catch(function(err) {
    console.error(err);
    res.status(500).send('Error retrieving file containers');
  });
});



app.get('/getVotesByUser/', async (req, res) => {
  try {
    const ownerId = currentLoggedInUser;

    // Fetch votes records by user ID
    const result = await db.query(`SELECT FROM Vote WHERE OwnerId = '${ownerId}'`);
    const votes = result;
    const promises = [];
    let html = `<h2 class="i-subname">Your Votes</h2><dir class="board"><table width="100%"><thead><tr><td>Owner</td><td>Value</td><td colspan="2">Dataset</td></tr></thead><tbody>`;
    for (let i = 0; i < votes.length; i++) {
      const vote = votes[i];
      const recordId = vote['@rid'];

      // Fetch related file container @rid
      const promiseFileContainer = db.query(`SELECT expand(out('Votes')).@rid FROM ${recordId}`)
        .then(async function(resultFileContainer) {
          const fileContainerRid = resultFileContainer[0]['@rid'];
          // Add file container @rid to vote object
          vote.fileContainerRid = fileContainerRid;
          const fileContainerRidFixed = '#' + fileContainerRid; // add "#" prefix to FileContainer ID

          // Fetch file container rid
          const result = await db.query(`SELECT FROM FileContainer WHERE @rid = '${fileContainerRidFixed}'`);
          const fileContainer = result[0];

          const resultUser = await getUser(fileContainer.OwnerId);

          html += `
            <tr>
              <td class="dataset">
              <img src="data:${resultUser.avatarMimeType};base64,${resultUser.avatarData.toString('base64')}"/>
              <div class="dataset-de">
                <h5>${resultUser.UsernameUser}</h5>
                <p>${resultUser.NameUser}</p>
              </div>
              <td class="active"><p>${vote.Value} points</p></td>
              <td class="dataset-des">
                <h5>${fileContainer.Name}</h5>
                <p>${fileContainer.Description}</p>
              </td>
              <td>
              <div onclick="getRelatedFiles('${fileContainer['@rid'].toString().substring(1)}')" class="edit"><a href="#">View Dataset</a></div>
            </td>
            </tr>
          `;
        })
        .catch(function(err) {
          console.error(err);
        });

      promises.push(promiseFileContainer);
    }
    await Promise.all(promises);
    html += '</tbody></table>';
    res.send(html);
  } catch(err) {
    console.error(err);
    res.status(500).send('Error retrieving votes');
  }
});

app.use(express.json()); // Add this middleware to parse JSON in the request body

app.post('/copy/:containerId', upload.none(), function(req, res) {
  const fileContainerId = req.params.containerId;
  const recordId = '#' + fileContainerId; // add "#" prefix to FileContainer ID
  const newContainerName = req.body.newContainerName; // New name for the copied file container
  // Step 1: Retrieve the existing file container based on OwnerId
  return db.query(`SELECT FROM FileContainer WHERE @rid = ${recordId}`)
    .then(function(container) {
      if (!container || container.length === 0) {
        throw new Error('File container not found');
      }

      const containerData = container[0];
      const containerRid = containerData['@rid'];

      // Step 2: Create a new file container with the new name
      return db.create('VERTEX', 'FileContainer')
        .set({
          Name: newContainerName,
          Description: containerData.Description,
          Size: containerData.Size,
          Date: new Date(),
          OwnerId: currentLoggedInUser,
          TotalVotes: 0
        }).one()
        .then(function(newContainer) {
          console.log('Created FileContainer Vertex: ' + newContainer.Name);

          // Step 3: Fetch related files @rid
          return db.query(`SELECT expand(out('Files')).@rid FROM ${containerRid}`)
            .then(function(resultRelatedFiles) {
              const relatedFileRids = resultRelatedFiles.map(function(file) {
                return file['@rid'];
              });

              // Step 4: Create a copy of the associated files with the new file container as the parent
              const files = relatedFileRids.map(function(fileRid) {
                return db.select().from('File').where({ '@rid': fileRid }).one()
                  .then(function(file) {
                    const fileData = Buffer.from(file.Data, 'base64');
                    return db.create('VERTEX', 'File')
                      .set({
                        Data: fileData.toString('base64'),
                        Name: file.Name,
                        MimeType: file.MimeType,
                        Size: file.Size
                      }).one()
                      .then(function(newFile) {
                        console.log('Created File Vertex: ' + newFile.Name);

                        // Step 5: Create an edge between the new file container and the new file
                        return db.create('EDGE', 'Files')
                          .from(newContainer['@rid'])
                          .to(newFile['@rid'])
                          .one().then(function(has) {
                            console.log('Created Files Edge between FileContainer and File');
                          });
                      });
                  });
              });

              // Step 6: Fetch the avatar file record @rid
              const promiseAvatar = db.query(`SELECT expand(in('Avatar')).@rid FROM ${recordId}`)
                .then(function(resultAvatar) {
                  const avatarRid = resultAvatar[0]['@rid'];
                  // Step 7: Create a copy of the avatar file with the new file container as the parent
                  return db.select().from('File').where({ '@rid': avatarRid }).one()
                    .then(function(avatarFile) {
                      const avatarFileData = Buffer.from(avatarFile.Data, 'base64');
                      return db.create('VERTEX', 'File')
                        .set({
                          Data: avatarFileData.toString('base64'),
                          Name: avatarFile.Name,
                          MimeType: avatarFile.MimeType,
                          Size: avatarFile.Size
                        }).one()
                        .then(function(newAvatarFile) {
                          console.log('Created Avatar File Vertex: '+ newAvatarFile.Name);
                          // Step 8: Create an edge between the new file container and the new avatar file
                          return db.create('EDGE', 'Avatar')
                            .from(newAvatarFile['@rid'])
                            .to(newContainer['@rid'])
                            .one().then(function(has) {
                              console.log('Created Avatar Edge between FileContainer and File');
                            });
                        });
                    });
                });
              return Promise.all(files.concat(promiseAvatar))
                .then(function() {
                  res.status(200).json({
                    message: 'File container successfully copied'
                  });                  
                });
            });
        });
    })
    .catch(function(err) {
      res.status(500).json({
        message: 'Error occurred while attempting to copy file container',
        success: false
      });      
    });
});

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Bases2TEC@',
  database: 'project1'
});

app.use(express.json());

// User registration endpoint
app.post('/register-user', (req, res) => {
  const { IdUser, NameUser, UsernameUser, LastnameUser, PasswordUser, BirthDate } = req.body;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(PasswordUser, salt);

  // Check if user ID already exists
  const checkIdQuery = `SELECT * FROM userdatahive WHERE IdUser = ${IdUser}`;
  connection.query(checkIdQuery, (error, results, fields) => {
    if (error) throw error;

    if (results.length > 0) {
      // User ID already exists, send error response
      res.status(400).send({ message: 'User ID already exists' });
    } else {
      // Check if username already exists
      const checkUsernameQuery = `SELECT * FROM userdatahive WHERE UsernameUser = '${UsernameUser}'`;
      connection.query(checkUsernameQuery, (error, results, fields) => {
        if (error) throw error;

        if (results.length > 0) {
          // Username already exists, send error response
          res.status(400).send({ message: 'Username already exists' });
        } else {
          // User ID and username do not exist, proceed with registration
          const insertQuery = `INSERT INTO userdatahive (IdUser, NameUser, UsernameUser, LastnameUser, PasswordUser, BirthDate) 
                               VALUES (${IdUser}, '${NameUser}', '${UsernameUser}', '${LastnameUser}', '${hash}', '${BirthDate}')`;
          connection.query(insertQuery, (error, results, fields) => {
            if (error) throw error;
            newlyCreatedUser = IdUser;
            console.log(newlyCreatedUser);
            res.send({ success: true });
          });
        }
      });
    }
  });
});

//load user

app.get('/view-profile/', (req, res) => {
  const id = currentLoggedInUser;
  const getUserQuery = `SELECT * FROM UserDataHive WHERE IdUser = ${id}`;
  connection.query(getUserQuery, (error, results, fields) => {
    if (error) throw error;

    if (results.length > 0) {
      const user = results[0];
      const html = `
        <section class="profile-view">
          <div class="profile-form">
            <h1>Your <span>profile</span></h1>
            <p>This is your account information</p>
            <form>
            <input type="text" name="username" placeholder="id" value="${user.IdUser}" readonly>
              <input type="text" name="username" placeholder="Username" value="${user.UsernameUser}" readonly>
              <input type="text" name="name" placeholder="Name" value="${user.NameUser}" readonly>
              <input type="text" name="lastname" placeholder="Last Name" value="${user.LastnameUser}" readonly>
              <input type="date" name="birthday" placeholder="Birthday" value="${new Date(user.BirthDate).toISOString().slice(0, 10)}" readonly>
            </form>
          </div>
          <div class="user-profile-img">
            <img id ="user-image" src="http://localhost:3000/getUserAvatar" alt="">
          </div>
        </section>
        `;
      res.send(html);
    } else {
      res.status(404).send({ error: 'User not found' });
    }
  });
});

app.get('/edit-profile/', (req, res) => {
  const id = currentLoggedInUser;
  const getUserQuery = `SELECT * FROM UserDataHive WHERE IdUser = ${id}`;
  connection.query(getUserQuery, (error, results, fields) => {
    if (error) throw error;

    if (results.length > 0) {
      const user = results[0];
      const html = `
        <section class="profile-view">
          <div class="profile-form">
            <h1>Hello <span>${user.UsernameUser}</span></h1>
            <p>Edit your information</p>
            <form>
              <input type="text" id="edit-username" name="username" placeholder="Username" value="">
              <input type="text" id="edit-name" name="name" placeholder="Name" value="">
              <input type="text" id="edit-last-name" name="lastname" placeholder="Last Name" value="">
              <input type="text" id="edit-password"placeholder="password" value="" />
              <input type="date" id="edit-birthday" name="birthday" placeholder="Birthday" value="">
              <input type="button" id="loadFileXml" value="Avatar" onclick="document.getElementById('selected-avatar').click();" />
              <input type="file" style="display:none;" id="selected-avatar" name="avatar" accept="image/*"/>
              <input type="submit" name="" value="Edit" class="button-profile-form" onclick="editUser(event)">
            </form>
          </div>
          <div class="user-profile-img">
            <p id="current-avatar-msg" style="display:none;">Current avatar:</p>
            <img id="image-dataset" src="" alt="">
          </div>
        </section>
        `;
      res.send(html);
    } else {
      res.status(404).send({ error: 'User not found' });
    }
  });
});

// User login endpoint
app.post('/login', (req, res) => {
  const { UsernameUser, PasswordUser } = req.body;
  const query = `SELECT * FROM userdatahive WHERE UsernameUser = '${UsernameUser}'`;
  connection.query(query, (error, results, fields) => {
    if (error) throw error;
    if (results.length > 0) {
      const user = results[0];
      const match = bcrypt.compareSync(PasswordUser, user.PasswordUser);
      if (match) {
        currentLoggedInUser= user.IdUser; 
        res.send({ success: true, message: "Logged in" });
      } else {
        res.send({ success: false, message: 'Invalid username or password' });
      }
    } else {
      res.send({ success: false, message: 'Invalid username or password' });
    }
  });
});


function getUser(IdUser) {
  return new Promise(function(resolve, reject) {
    connection.query(`SELECT * FROM userdatahive WHERE IdUser = ?`, [IdUser], function(err, result) {
      if (err) {
        reject(err);
      } else if (result.length === 1) {
        const user = result[0];
        db.query(`SELECT FROM UserAvatar WHERE OwnerId =${IdUser}`)
          .then(function(resultAvatar) {
            const avatarRid = resultAvatar[0]['@rid'];
            db.query(`SELECT FROM ${avatarRid}`)
              .then(function(resultAvatarFile) {
                const avatarData = resultAvatarFile[0].Data;
                const avatarBuffer = Buffer.from(avatarData, 'base64');
                const avatarMimeType = resultAvatarFile[0].MimeType;
                user.avatarData = avatarBuffer;
                user.avatarMimeType = avatarMimeType;
                resolve(user);
              })
              .catch(function(err) {
                reject(err);
              });
          })
          .catch(function(err) {
            reject(err);
          });
      } else {
        reject('User not found');
      }
    });
  });
}

// Update user endpoint
app.post('/update-user/', (req, res) => {
  const { NameUser, UsernameUser, LastnameUser, PasswordUser, BirthDate } = req.body;
  const fieldsToUpdate = {};
  let query = `UPDATE UserDataHive SET`;

  if (NameUser) {
    query += ` NameUser = '${NameUser}',`;
    fieldsToUpdate.NameUser = NameUser;
  }

  if (UsernameUser) {
    connection.query(`SELECT IdUser FROM UserDataHive WHERE UsernameUser = ?`, [UsernameUser], (error, results, fields) => {
      if (error) throw error;

      if (results.length > 0 && results[0].IdUser !== currentLoggedInUser) {
        res.status(400).send('Username already exists');
        return;
      } else {
        query += ` UsernameUser = '${UsernameUser}',`;
        fieldsToUpdate.UsernameUser = UsernameUser;
      }
    });
  }

  if (LastnameUser) {
    query += ` LastnameUser = '${LastnameUser}',`;
    fieldsToUpdate.LastnameUser = LastnameUser;
  }

  if (PasswordUser) {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(PasswordUser, salt);
    query += ` PasswordUser = '${hash}',`;
    fieldsToUpdate.PasswordUser = PasswordUser;
  }

  if (BirthDate) {
    query += ` BirthDate = '${BirthDate}',`;
    fieldsToUpdate.BirthDate = BirthDate;
  }

  // Check if there are fields to update
  if (Object.keys(fieldsToUpdate).length === 0) {
    res.status(400).send('No fields to update');
    return;
  }

  // Remove trailing comma from query string
  query = query.slice(0, -1);

  // Add WHERE clause to only update the specified user
  query += ` WHERE IdUser = ${currentLoggedInUser}`;
  console.log(query);

  // Execute the query and update the user in the database
  connection.query(query, (error, results, fields) => {
    if (error) throw error;
    console.log(`Updated user with ID ${currentLoggedInUser}`);

    // Get the updated user from the database and send it back in the response
    const getUserQuery = `SELECT * FROM UserDataHive WHERE IdUser = ${currentLoggedInUser}`;
    connection.query(getUserQuery, (error, results, fields) => {
      if (error) throw error;
      res.send({ success: true, message: "upload" });
    });
  });
});


app.get('/getAllUsers', function(req, res) {
  connection.query(`SELECT * FROM UserDataHive WHERE IdUser != ?`, [currentLoggedInUser], function(error, results, fields) {
    if (error) {
      res.status(400).json({"error": error.message});
      return;
    }
    let html = `<h2 class="i-subname">Users</h2><dir class="board"><table width="100%"><thead><tr><td>User</td><td colspan="3">Real Name</td></tr></thead><tbody>`;
    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      getUser(row.IdUser).then(user => {
        html += `<tr>
                  <td class="dataset">
                    <img src="data:${user.avatarMimeType};base64,${user.avatarData.toString('base64')}"/>
                    <div class="dataset-de">
                      <h5>${user.UsernameUser}</h5>
                      <p>${new Date(user.BirthDate).toLocaleString(undefined, { timeZone: 'UTC', hour12: false, timeZoneName: 'short' })}</p>
                    </div>
                  </td>
                  <td class="dataset-des">
                    <h5>${user.NameUser}</h5>
                    <p>${user.LastnameUser}</p>
                  </td>
                  <td>
                  <div onclick="getContainersByUserSpecificId('${user.IdUser}')" class="edit"><a href="#">View Datasets</a></div>
                  </td>
                  <td>
                    <div class="edit" data-userid="${user.IdUser}"><a href="#">Follow</a></div>
                  </td>
                </tr>`;
        if (i == results.length - 1) {
          html += '</tbody></table></dir>';
          res.send(html);
        }
      }).catch(error => {
        res.status(400).json({"error": error.message});
      });
    }
  });
});

app.get('/getUsersByUsername/:userName', function(req, res) {
  searching = req.params.userName; 
  console.log(searching);
  connection.query(`SELECT * FROM UserDataHive WHERE UsernameUser = ? AND IdUser != ?`, [searching, currentLoggedInUser], function(error, results, fields) {
    if (error) {
      res.send("Cannot GET");
      return;
    }
    if (results.length === 0) {
      res.send('<h2 class="i-subname">There are no users with that username.</h2>');
      return;
    }
    let html = `<h2 class="i-subname">Users with the Username <p style="color: #EAAA00;">${searching}</p></h2><dir class="board"><table width="100%"><thead><tr><td>User</td><td colspan="3">Real Name</td></tr></thead><tbody>`;
    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      getUser(row.IdUser).then(user => {
        html += `<tr>
                  <td class="dataset">
                    <img src="data:${user.avatarMimeType};base64,${user.avatarData.toString('base64')}"/>
                    <div class="dataset-de">
                      <h5>${user.UsernameUser}</h5>
                      <p>${new Date(user.BirthDate).toLocaleString(undefined, { timeZone: 'UTC', hour12: false, timeZoneName: 'short' })}</p>
                    </div>
                  </td>
                  <td class="dataset-des">
                    <h5>${user.NameUser}</h5>
                    <p>${user.LastnameUser}</p>
                  </td>
                  <td>
                  <div onclick="getContainersByUserSpecificId('${user.IdUser}')" class="edit"><a href="#">View Datasets</a></div>
                  <td>
                    <div class="edit" data-userid="${user.IdUser}"><a href="#">Follow</a></div>
                  </td>
                </tr>`;
        if (i == results.length - 1) {
          html += '</tbody></table></dir>';
          res.send(html);
        }
      }).catch(error => {
        res.status(400).send({"error": error.message});
      });
    }
  });
});

app.get('/copy-dataset/:fileContainer', (req, res) => {
  const id = currentLoggedInUser;
  const fileContainerRID = req.params.fileContainer;
  const containerRidFixed = '#' + fileContainerRID; // add "#" prefix to FileContainer ID

    db.query(`SELECT FROM FileContainer WHERE @rid = '${containerRidFixed}'`)
    .then((results) => {
      if (results.length > 0) {
        const fileContainer = results[0];
        const html = `
          <section class="profile-view">
            <div class="profile-form">
              <h1>Copying <span>${fileContainer.Name}</span></h1>
              <p>Enter the new name for the dataset</p>
              <form>
                <input type="text" id="newContainerName" name="newContainerName" placeholder="New Dataset Name" value="">
                <input type="submit" name="" value="Copy" class="button-profile-form" onclick="copyDataset('${fileContainerRID}')">
              </form>
            </div>
            <div class="user-profile-img">
              <img id="image-dataset" src="" alt="">
            </div>
          </section>
          `;
        res.send(html);
      } else {
        res.status(404).send({ error: 'File container not found' });
      }
    }).catch((error) => {
      console.log(error);
      res.status(500).send({ error: 'Internal server error' });
    });
});

// Add a follower
app.get('/follow/:userId', (req, res) => {
  const userId = req.params.userId;
  const followerId = currentLoggedInUser; // Get the ID of the user who is following
  
  // Insert into the UserFollowers table
  connection.query('INSERT INTO UserFollowers (IdUser, IdFollower) VALUES (?, ?)', [userId, followerId], (error, results) => {
    if (error) throw error;
    res.send({ message: `User with ID ${followerId} started following user with ID ${userId}` });
  });
});

// Remove a follower
app.get('/unfollow/:userId', (req, res) => {
  const userId = req.params.userId;
  const followerId = currentLoggedInUser; // Get the ID of the user who is unfollowing
  
  // Delete from the UserFollowers table
  connection.query('DELETE FROM UserFollowers WHERE IdUser = ? AND IdFollower = ?', [userId, followerId], (error, results) => {
    if (error) throw error;
    res.send({ message: `User with ID ${followerId} stopped following user with ID ${userId}` });
  });
});

app.get('/check-follower/:userId', (req, res) => {
  const userId = req.params.userId;
  const followerId = currentLoggedInUser;
  connection.query('SELECT * FROM UserFollowers WHERE IdUser = ? AND IdFollower = ?', [userId, followerId], (error, results) => {
    if (error) {
      res.status(500).send({ error: error.message });
    } else {
      if (results.length === 0) {
        res.send({ isFollower: false });
      } else {
        res.send({ isFollower: true });
      }
    }
  });
});

// Function to get the number of followers of a user in MySQL
function getFollowersCount(userId) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT COUNT(*) AS Followers FROM UserFollowers WHERE IdUser = ?', [userId], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0].Followers);
      }
    });
  });
}

// Function to get the number of users followed by a user in MySQL
function getFollowingCount(userId) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT COUNT(*) AS Following FROM UserFollowers WHERE IdFollower = ?', [userId], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0].Following);
      }
    });
  });
}

// Function to get the number of votes of a filecontainer in OrientDB
function getVotes(filecontainerId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT SUM(Value) AS Votes 
      FROM (SELECT EXPAND(in('VOTES')).Value FROM #${filecontainerId})
    `;
    db.query(query)
      .then(results => {
        resolve(results[0].Votes);
      })
      .catch(error => {
        reject(error);
      });
  });
}


function getFileContainers(ownerId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT FROM FileContainer 
      WHERE OwnerId = :ownerId
    `;
    db.query(query, { params: { ownerId } })
      .then(results => {
        resolve(results);
      })
      .catch(error => {
        reject(error);
      });
  });
}

app.get('/getStadistics', (req, res) => {
  const userId = currentLoggedInUser;
  // Obtain followers amount
  getFollowersCount(userId)
    .then(followersCount => {
      // Obtain following amount
      getFollowingCount(userId)
        .then(followingCount => {
          // Obtain all datasets
          getFileContainers(userId)
            .then(fileContainers => {
              // Obtain total votes
              let totalVotes = 0;
              const promises = fileContainers.map(fileContainer => {
                return getVotes(fileContainer['@rid'].toString().substr(1))
                  .then(votes => {
                    totalVotes += votes;
                  });
              });
              Promise.all(promises)
                .then(() => {
                  // Render the view with the results
                  res.send(`
                  <div id="stadistics" class="values">
                    <div class="val-box">
                      <i class="fa fa-users"></i>
                      <div>
                        <h3>${followersCount}</h3>
                        <span>Followers</span>
                      </div>
                    </div>
                    <div class="val-box">
                      <i class="fa fa-users"></i>
                      <div>
                        <h3>${followingCount}</h3>
                        <span>Following</span>
                      </div>
                    </div>
                    <div class="val-box">
                      <i class="fa fa-file"></i>
                      <div>
                        <h3>${fileContainers.length}</h3>
                        <span>Datasets</span>
                      </div>
                    </div>
                    <div class="val-box">
                      <i class="fa fa-thumbs-up"></i>
                      <div>
                        <h3>${totalVotes} points</h3>
                        <span>Your score</span>
                      </div>
                    </div>
                  </div>
                  `);
                })
                .catch(error => {
                  console.error(error);
                  res.status(500).send('Internal Server Error');
                });
            })
            .catch(error => {
              console.error(error);
              res.status(500).send('Internal Server Error');
            });
        })
        .catch(error => {
          console.error(error);
          res.status(500).send('Internal Server Error');
        });
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Internal Server Error');
    });
});

// Function to create a notification for a user's followers
function createNotificationForFollowers(userId, datasetName, datasetRid) {
  // Get the username of the user who created the file
  getUser(userId)
    .then(user => {
      const followersQuery = `SELECT IdFollower FROM UserFollowers WHERE IdUser = ${userId}`;
      connection.query(followersQuery, (getFollowersError, followers) => {
        if (getFollowersError) {
          console.error('Error getting user followers: ', getFollowersError);
          return;
        }
        // Loop through a user's followers and create a notification for each of them
        followers.forEach((follower) => {
          const followerId = follower.IdFollower;
          const notificationMessage = `${user.UsernameUser} uploaded a new dataset named ${datasetName}`;
          const notificationQuery = `INSERT INTO UserNotification (IdUploader, IdUser, DatasetTName, DatasetRid, Message) VALUES (${userId}, ${followerId}, '${datasetName}', '${datasetRid}', '${notificationMessage}')`;

          connection.query(notificationQuery, (createNotificationError, notificationResult) => {
            if (createNotificationError) {
              console.error('Error creating notification for follower: ', createNotificationError);
              return;
            }
            console.log(`Notification created for follower ${followerId}`);
          });
        });
      });
    })
    .catch(error => {
      console.error('Error getting user: ', error);
    });
}

app.get('/getNotifications', function(req, res) {
  const userId = currentLoggedInUser;
  const notificationsQuery = `SELECT * FROM UserNotification WHERE IdUser = ${userId}`;

  connection.query(notificationsQuery, function(error, results) {
    if (error) {
      console.error('Error getting notifications: ', error);
      res.status(500).send('An error occurred while retrieving notifications.');
    } else {
      const notifications = results.map(notification => ({
        uploader: notification.IdUploader,
        datasetName: notification.DatasetTName,
        datasetRid: notification.DatasetRid,
        message: notification.Message,
        notificationDate: notification.NotificationDate
      }));

      let tableRows = '';
      notifications.forEach(notification => {
        tableRows += `<tr>
                        <td>${notification.message}</td>
                        <td>${new Date(notification.notificationDate).toLocaleString(undefined, { timeZone: 'UTC', hour12: false, timeZoneName: 'short' })}</td>
                      </tr>`;
      });

      const html = `
      <html>
      <head>
        <title>Notifications</title>
        <style>
          .table-container {
            position: fixed;
            top: 50px;
            right: 20px;
            width: 400px;
            height: 400px;
            background-color: #fff;
            border: 1px solid #ccc;
            margin-top: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            overflow: auto;
            display: none;
            z-index: 1;
          }
    
          .table-container table {
            width: 100%;
            border-collapse: collapse;
          }
    
          .table-container th,
          .table-container td {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: left;
            vertical-align: middle;
          }
    
          .table-container th {
            background-color: #eee;
          }
    
          .fa-bell:hover {
            color: #666;
          }
    
          .table-container:after {
            content: "";
            position: absolute;
            top: -20px;
            right: 10px;
            border-left: 20px solid transparent;
            border-right: 20px solid transparent;
            border-bottom: 20px solid #ccc;
          }

          .arrow-up {
            position: absolute;
            right: 79px;
            width: 0;
            height: 0;
            display:none;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 10px solid #ccc;
          }

        </style>
        <script src="https://kit.fontawesome.com/a076d05399.js"></script>
      </head>
      <body>
        <div class="arrow-up"></div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Notification</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      </body>
    </html>
    `;
    res.send(html);        
    }
  });
});

app.get('/getDownloadsData/:containerRid', async function(req, res) {
  const containerRid = req.params.containerRid;
  try {
    const downloaders = await checkDownloaders(containerRid);
    console.log(downloaders);
    const downloaderIds = downloaders.map(downloader => downloader);
    connection.query(`SELECT * FROM UserDataHive WHERE IdUser IN (?)`, [downloaderIds], async function(error, results, fields) {
      if (error) {
        res.status(400).json({"error": error.message});
        return;
      }
      let html = `<h2 class="i-subname">Users</h2><dir class="board"><table width="100%"><thead><tr><td>User</td><td colspan="3">Real Name</td></tr></thead><tbody>`;
      for (let i = 0; i < results.length; i++) {
        const row = results[i];
        const user = await getUser(row.IdUser);
        html += `<tr>
                  <td class="dataset">
                    <img src="data:${user.avatarMimeType};base64,${user.avatarData.toString('base64')}"/>
                    <div class="dataset-de">
                      <h5>${user.UsernameUser}</h5>
                      <p>${new Date(user.BirthDate).toLocaleString(undefined, { timeZone: 'UTC', hour12: false, timeZoneName: 'short' })}</p>
                    </div>
                  </td>
                  <td class="dataset-des">
                    <h5>${user.NameUser}</h5>
                    <p>${user.LastnameUser}</p>
                  </td>
                  <td>
                  <div onclick="getContainersByUserSpecificId('${user.IdUser}')" class="edit"><a href="#">View Datasets</a></div>
                  </td>
                </tr>`;
        if (i == results.length - 1) {
          html += '</tbody></table></dir>';
          res.send(html);
        }
      }
    });
  } catch (error) {
    res.status(400).json({"error": error.message});
  }
});

// Start the server on port 3000
app.listen(3000, function () {
    console.log('Server started on port 3000!');
});

//Mongo---------------------------------------------------------------------------
const fileUpload = require('express-fileupload');
const { startConnection } = require('./mongoDB/DB/database.js');
const commentsController = require('./mongoDB/controllers/comments.controller.js');
//--------------------------------------------------------------------------------------
//Mongo---------------------------------
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));
app.use(morgan('dev'));
app.post('/comments/create', commentsController.createComment)
app.get('/comments/getbyDataset/:datasetId', commentsController.getComments)
app.post('/comments/createResponse', commentsController.createCommentResponse)
//-------------------------------------------///

//Mongo------------------------------------------------------------------------
async function main() {
  await startConnection();
}


main();