const multer = require('multer');
const fs = require('fs');
const Client = require('ssh2-sftp-client');
require('dotenv').config();
const { fetchUsersFromID } = require('../models/users');
const { createFile } = require('../models/file');
const { createLog } = require('../models/activityLog'); 

// Set up Multer for file upload with disk storage
const upload = multer({
  storage: multer.diskStorage({
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
});

// Endpoint to handle file upload
const handleFileUpload = async (req, res, io, id) => {
  const user = await fetchUsersFromID(id);
  const sftp = new Client();
  const tempPath = req.file.path;

  const folderPath = req.query.path || '/';
  const remotePath = `/home/${user.username}${folderPath}/${req.file.originalname}`;

  
  try {
    await sftp.connect({
      host: process.env.host,
      port: process.env.port,
      username: user.username,
      password: user.password,
    });

    const fileName = req.file.originalname;
    const fileSize = req.file.size;
    const ownerID = id;
    const path = remotePath;

    // Ensure the target folder exists before uploading
    await sftp.mkdir(remotePath.substring(0, remotePath.lastIndexOf('/')), true);

    const stream = fs.createReadStream(tempPath); 
    let uploadedSize = 0;

    stream.on('data', (chunk) => {
      uploadedSize += chunk.length;
      const progress = ((uploadedSize / fileSize) * 100).toFixed(2);
      // Emit progress to the client
      io.emit('uploadProgress', { fileName: req.file.originalname, progress });
    });

    await sftp.put(stream, remotePath);

    const result = await createFile(fileName, fileSize, ownerID, path);

    const dateString = new Date().toLocaleDateString();
    await createLog(id, id, `Uploaded file: ${fileName}`, dateString);

    // Respond to client
    res.send('File uploaded successfully!');
  } catch (err) {
    console.error('Error during upload:', err.message);
    res.status(500).send('Failed to upload file.');
  } finally {
    // Clean up the temporary file
    fs.unlink(tempPath, (err) => {
      if (err) console.error('Failed to delete temp file:', err.message);
    });

    await sftp.end();
  }
};

module.exports = {
  upload,
  handleFileUpload,
};

  
