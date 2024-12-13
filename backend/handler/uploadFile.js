const multer = require('multer');
const fs = require('fs');
const Client = require('ssh2-sftp-client');
require('dotenv').config();
const { fetchUsersFromID } = require('../models/users');
const { createFile } = require('../models/file');

// Set up Multer for file upload with disk storage
const upload = multer({
  storage: multer.diskStorage({
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
});

// Endpoint to handle file upload
const handleFileUpload = async (req, res, id) => {
  const user = await fetchUsersFromID(id);
  const sftp = new Client();
  const tempPath = req.file.path;
  const remotePath = `/home/${user.username}/${req.file.originalname}`;

  try {
    await sftp.connect({
      host: process.env.host,
      port: process.env.port,
      username: user.username,
      password: user.password,
    });

    await sftp.put(tempPath, remotePath);
    console.log(`Uploaded ${req.file.originalname} to ${remotePath}`);

    const fileName = req.file.originalname;
    const fileSize = req.file.size;
    const ownerID = id;
    const path = remotePath;
    const fileID = id + fileSize;

    const result = await createFile(fileID, fileName, fileSize, ownerID, path);

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

  