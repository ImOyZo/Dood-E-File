const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Client = require('ssh2-sftp-client');
const { get } = require('http');

const username = 'SFTP-USERNAME';
const password = 'SFTP-PASSWORD';

// Endpoint to list files from the remote server
const handleFileList = async (req, res) => {
    const sftp = new Client();
    const remoteDir = `/home/${username}/`; // Remote directory to list files
  
    try {
      await sftp.connect({
        host: 'localhost',
        port: 22,
        username: username,
        password: password,
      });
  
      const fileList = await sftp.list(remoteDir);
  
      // Map the files to a JSON structure
      const files = fileList.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type === '-' ? 'file' : 'directory',
      }));
  
      res.json(files); // Send the list of files as JSON
    } catch (err) {
      console.error('Error listing files:', err.message);
      res.status(500).send('Failed to list files.');
    } finally {
      await sftp.end();
    }
};

module.exports = {
  handleFileList,
};