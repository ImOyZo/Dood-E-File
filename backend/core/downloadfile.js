const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Client = require('ssh2-sftp-client');

const app = express();

const username = 'YOUR-SFTP-USERNAME';
const password = 'YOUR-SFTP-PASSWORD';

// Endpoint to download a file from the remote server
app.get('/download/:filename', async (req, res) => {
    const sftp = new Client();
    // As temp file path
    const filename = 'AnyDesk.exe';
    const remotePath = `/home/wibawa/${filename}`;
    const tempFilePath = path.join(__dirname, 'temp', filename);
  
    try {
      await sftp.connect({
        host: 'localhost',
        port: 22,
        username: username,
        password: password,
      });

      const fileBuffer = await sftp.get(remotePath);
      const { Readable } = require('stream');
      const fileStream = Readable.from(fileBuffer);
      
      res.setHeader('Content-Disposition', `attachement; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');

      fileStream.pipe(res).on('finish', () => {
        console.log('File Stream Successfull');
      });

    } catch (err){
        console.error('Error during download', err.message);
        res.status(500).send('Failed to download file');
    } finally {
        await sftp.end();
    }
  });
  
// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });