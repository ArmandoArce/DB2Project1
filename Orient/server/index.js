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

// Create OrientDB server connection
var server = OrientDB({
   host:     'localhost',
   port:     2424,
   username: 'root',
   password: 'Proyecto1@',
   useToken: true
});

// Use OrientDB server to connect to a specific database
var db = server.use({
    name: 'Project1',
    username: 'admin',
    password: 'admin'
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
 * Endpoint for file upload
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
      OwnerId: 0,
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

  res.send('Files uploaded successfully');
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
          const avatarFilename = containerName + path.extname(avatar.Name); // set the filename as "Containername.extension"
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
  const userId = 3; // get user ID, you can implement logic to obtain it
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


app.post('/getContainersByDescription', upload.none(), function(req, res) {
  contaierDescription = req.body.description;
  // Fetch file container records by description
  db.query(`SELECT FROM FileContainer WHERE Description = '${contaierDescription}'`)
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
        // Build HTML table from file container objects and send to client
        let html = '<h2 class="i-subname">Datasets by Description</h2><dir class="board"><table width="100%"><thead><tr><td>Owner</td><td colspan="2" style="text-align: center;">Dataset</td><td>Total Votes</td><td></td><td></td></tr></thead><tbody>';
        for (let i = 0; i < fileContainers.length; i++) {
          const fileContainer = fileContainers[i];
          html += `<tr>
          <td >${fileContainer.OwnerId}</td>
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
            <form method="get" action="http://localhost:3000/getFilesByContainerRid/${fileContainer['@rid'].toString().substring(1)}">
              <div onclick="this.closest('form').submit();" class="edit"><a href="#">Get Related Files</a></div>
            </form>
          </td>
          <td>
            <form method="get" action="http://localhost:3000/getVotesByContainerRid/${fileContainer['@rid'].toString().substring(1)}">
              <div onclick="this.closest('form').submit();" class="edit"><a href="#">Get Votes</a></div>
          </form>        
          </td>
       </tr>`;
      }
        html += '</tbody></table>';
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
        // Build HTML table from file container objects and send to client
        let html = '<h2 class="i-subname">All Datasets</h2><dir class="board"><table width="100%"><thead><tr><td>Owner</td><td colspan="2" style="text-align: center;">Dataset</td><td>Total Votes</td><td></td><td></td></tr></thead><tbody>';
        for (let i = 0; i < fileContainers.length; i++) {
          const fileContainer = fileContainers[i];
          html += `<tr>
          <td >${fileContainer.OwnerId}</td>
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
              <div onclick="getRelatedFiles('${fileContainer['@rid'].toString().substring(1)}')" class="edit"><a href="#">Get Related Files</a></div>
          </td>
          <td>
            <form method="get" action="http://localhost:3000/getVotesByContainerRid/">
            <div onclick="getRelatedVotes('${fileContainer['@rid'].toString().substring(1)}')" class="edit"><a href="#">Get Votes</a></div>
          </form>        
          </td>
       </tr>`;
      }
        html += '</tbody></table></dir>';
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

app.post('/getContainersByName', upload.none(), function(req, res) {
  containerName = req.body.name;
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
        // Build HTML table from file container objects and send to client
        let html = '<h2 class="i-subname">Datasets by Name</h2><dir class="board"><table width="100%"><thead><tr><td>Owner</td><td colspan="2" style="text-align: center;">Dataset</td><td>Total Votes</td><td></td><td></td></tr></thead><tbody>';
        for (let i = 0; i < fileContainers.length; i++) {
          const fileContainer = fileContainers[i];
          html += `<tr>
          <td >${fileContainer.OwnerId}</td>
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
            <form method="get" action="http://localhost:3000/getFilesByContainerRid/${fileContainer['@rid'].toString().substring(1)}">
              <div onclick="this.closest('form').submit();" class="edit"><a href="#">Get Related Files</a></div>
            </form>
          </td>
          <td>
            <form method="get" action="http://localhost:3000/getVotesByContainerRid/${fileContainer['@rid'].toString().substring(1)}">
              <div onclick="this.closest('form').submit();" class="edit"><a href="#">Get Votes</a></div>
          </form>        
          </td>
       </tr>`;
      }
        html += '</tbody></table>';
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

    let html = `<dir class="board"><table width="100%"><thead><tr><td>Owner</td><td colspan="2" style="text-align: center;">Dataset</td><td>Total Votes</td><td></td><td></td></tr></thead><tbody>
    <tr>
      <td >${fileContainer.OwnerId}</td>
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
    <form method="get" action="http://localhost:3000/vote/${containerRid}/" onsubmit="this.action += document.getElementById('rating-select').value; fetch(this.action).then(response => response.text()).then(message => window.alert(message)); return false;" target="dummyframe">
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
    html += '<h2 class="i-subname">Dataset Files</h2><dir class="board"><table width="100%"><thead><tr><td>Name</td><td>Size</td><td colspan ="2">MimeType</td></tr></thead><tbody>';
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
    html += '</tbody></table>';
    res.send(html);
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

    // Build HTML table from file container objects and send to client
    let html = `<dir class="board"><table width="100%"><thead><tr><td>Owner</td><td colspan="2" style="text-align: center;">Dataset</td><td>Total Votes</td><td></td><td></td></tr></thead><tbody>
    <tr>
      <td >${fileContainer.OwnerId}</td>
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
      //      <img src=""/> eso va después del div class dataset de
      html += `
      <tr>
      <td class="dataset">
        <div class="dataset-de">
          <h5>${fileContainer.OwnerId}</h5>
          <p>Description</p>
        </div>
      </td>
      <td class="active"><p>${vote.Value} points</p></td>
      </tr>`;
    }
    html += '</tbody></table></dir>';
    res.send(html);
  } catch(err) {
    console.error(err);
    res.status(500).send('Error retrieving file containers');
  }
});

app.get('/getContainersByUser/:ownerId', upload.none(), function(req, res) {
  containerOwnerId = req.params.ownerId;
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
        // Build HTML table from file container objects and send to client
        let html = '<h2>Datasets by Name</h2><table><thead><tr><th>Owner</th><th>Name</th><th>Description</th><th>Size</th><th>Date</th><th>Total Votes</th><th>Avatar</th><th>Related Files</th><th>Related Votes</th></tr></thead><tbody>';
        for (let i = 0; i < fileContainers.length; i++) {
          const fileContainer = fileContainers[i];
          html += `<tr>
          <td>${fileContainer.OwnerId}</td>
          <td>${fileContainer.Name}</td>
          <td>${fileContainer.Description}</td>
          <td>${fileContainer.Size} bytes</td>
          <td>${fileContainer.Date}</td>
          <td>${fileContainer.TotalVotes}</td>
          <td><img src="data:${fileContainer.avatarMimeType};base64,${fileContainer.avatarData.toString('base64')}" style="width: 100px; height: 100px;"/></td>
          <td>
            <form method="get" action="http://localhost:3000/getFilesByContainerRid/${fileContainer['@rid'].toString().substring(1)}">
              <button type="submit">Get Related Files</button>
            </form>
          </td>
          <td>
            <form method="get" action="http://localhost:3000/getVotesByContainerRid/${fileContainer['@rid'].toString().substring(1)}">
              <button type="submit">Get Votes</button>
            </form>
          </td>
       </tr>`;
      }
        html += '</tbody></table>';
        res.send(html);
        return;
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



app.get('/getVotesByUser/:ownerId', async (req, res) => {
  try {
    const ownerId = req.params.ownerId;

    // Fetch votes records by user ID
    const result = await db.query(`SELECT FROM Vote WHERE OwnerId = '${ownerId}'`);
    const votes = result;
    const promises = [];
    let html = `<h2 class="i-subname">User Votes</h2><dir class="board"><table width="100%"><thead><tr><td>Owner</td><td>Value</td><td colspan="2">Dataset info</td></tr></thead><tbody>`;
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

          html += `
            <tr>
              <td class="dataset">
                <div class="dataset-de">
                  <h5>${fileContainer.OwnerId}</h5>
                  <p>Description</p>
                </div>
              </td>
              <td class="active"><p>${vote.Value} points</p></td>
              <td>${fileContainer.Name}</td>
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
          OwnerId: 0,
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
                  res.status(200).send({
                    message: 'File container successfully copied'
                  });
                });
            });
        });
    })
    .catch(function(err) {
      res.status(500).send({
        message: 'Error occurred while attempting to copy file container',
        success: false
      });
    });
});

// Start the server on port 3000
app.listen(3000, function () {
    console.log('Server started on port 3000!');
});