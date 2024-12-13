const Client = require('ssh2-sftp-client');
require('dotenv').config();
const { fetchUsersFromID } = require('../models/users');

// Endpoint to download a file from the remote server
const handleFileDownload = async (req, res, filename, id) => {
    const user = await fetchUsersFromID(id);
    const sftp = new Client();
    const remotePath = `/home/${user.username}/${filename}`;
  
    try {
      await sftp.connect({
        host: process.env.host,
        port: process.env.port,
        username: user.username,
        password: user.password,
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
};

module.exports = {
  handleFileDownload,
};