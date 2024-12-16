// WIP

const express = require('express');
const multer = require('multer');
const Client = require('ssh2-sftp-client');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
require('dotenv').config();

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Temporary local storage

const sftp = new Client();

// Fake database for file metadata and share tokens
const fileDB = new Map(); // { token: { path, filename, permissions, expiresAt } }

// Upload file and generate a shareable link
router.post('/upload', upload.single('file'), async (req, res) => {
  const { username } = req.body; // Assume user auth already handled
  const file = req.file;

  const remotePath = `/home/${username}/${file.originalname}`;
  const token = uuidv4(); // Generate unique token

  try {
    await sftp.connect({
      host: process.env.SFTP_HOST,
      port: process.env.SFTP_PORT,
      username: process.env.SFTP_USER,
      password: process.env.SFTP_PASS,
    });

    // Upload file to SFTP server
    await sftp.put(file.path, remotePath);

    // Store metadata in database
    fileDB.set(token, {
      path: remotePath,
      filename: file.originalname,
      permissions: 'public', // Default to public
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiration
    });

    res.json({ message: 'File uploaded successfully!', shareLink: `http://localhost:3000/share/${token}` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('File upload failed.');
  } finally {
    fs.unlink(file.path, () => {}); // Clean up local file
    await sftp.end();
  }
});
