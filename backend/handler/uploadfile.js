const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Client = require('ssh2-sftp-client');

const username = 'SFTP-USERNAME';
const password = 'SFTP-PASSWORD';

// Set up Multer for file upload with disk storage
const upload = multer({
  storage: multer.diskStorage({
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
});

// Endpoint to handle file upload
const handleFileUpload = async (req, res) => {
  const sftp = new Client();
  const tempPath = req.file.path;
  const remotePath = `/home/${username}/${req.file.originalname}`;

  try {
    await sftp.connect({
      host: 'localhost',
      port: 22,
      username: username,
      password: password,
    });

    await sftp.put(tempPath, remotePath);
    console.log(`Uploaded ${req.file.originalname} to ${remotePath}`);

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

  