const multer = require('multer');
const Client = require('ssh2-sftp-client');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
require('dotenv').config();
const { fetchUsersFromID } = require('../models/users');
const path = require('path');
const { createFile } = require('../models/file');

const fileDB = new Map(); // Temporary in-memory database
const sftp = new Client();

// Multer setup for handling file uploads
const upload = multer({
  storage: multer.diskStorage({
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
});

// Helper function to ensure the folder exists
const ensureFolderExists = async (sftp, folderPath) => {
  const folderExists = await sftp.exists(folderPath);
  if (!folderExists) {
    await sftp.mkdir(folderPath, true); // Recursive creation
  }
};

// Shared upload handler
const handleSharedUpload = async (req, res) => {
  const id = req.body.userId; // Assuming user ID is passed in the request body
  const folderPath = req.body.folderPath || ''; // Optional folder path
  const tempPath = req.file.path;
  const originalname = req.file.originalname;
  const token = uuidv4(); // Unique token for file sharing

  try {
    const user = await fetchUsersFromID(id);
    if (!user) throw new Error('User not found');

    await sftp.connect({
      host: process.env.host,
      port: process.env.port,
      username: user.username,
      password: user.password,
    });

    const remoteFolderPath = `/home/${user.username}/${folderPath}`;
    const remotePath = `${remoteFolderPath}/${originalname}`;

    // Ensure the target folder exists
    await ensureFolderExists(sftp, remoteFolderPath);

    // Upload the file to the remote server
    await sftp.put(tempPath, remotePath);

    // Save metadata in the in-memory database
    fileDB.set(token, {
      path: remotePath,
      filename: originalname,
      permissions: 'public', // Default permission
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiration
    });

    res.json({
      message: 'File uploaded successfully!',
      shareLink: `http://localhost:3000/share/${token}`,
    });
  } catch (error) {
    console.error('Error during upload:', error.message);
    res.status(500).send('File upload failed.');
  } finally {
    // Clean up the local file
    fs.unlink(tempPath, (err) => {
      if (err) console.error('Failed to delete temp file:', err.message);
    });

    await sftp.end();
  }
};

// Shared download handler
const handleSharedDownload = async (req, res) => {
  const token = req.params.token; 
  const fileMetadata = fileDB.get(token);

  if (!fileMetadata || Date.now() > fileMetadata.expiresAt) {
      return res.status(404).send('File not found or link expired.');
  }

  try {
      const user = await fetchUsersFromID(fileMetadata.loginID);
      if (!user) throw new Error('User not found');

      await sftp.connect({
          host: process.env.host,
          port: process.env.port,
          username: user.username,
          password: user.password,
      });

      if (fileMetadata.isDirectory) {
          const folderContents = await sftp.list(fileMetadata.path);
          res.json({ folderContents });
      } else {
          const fileStream = await sftp.get(fileMetadata.path);
          res.setHeader('Content-Disposition', `attachment; filename="${fileMetadata.filename}"`);
          fileStream.pipe(res);
      }
  } catch (err) {
      console.error('Error during download:', err.message);
      res.status(500).send('Download failed.');
  } finally {
      await sftp.end();
  }
};

const fetchFileDetails = async (loginID, pathFile) => {
    const user = await fetchUsersFromID(loginID);

    if (!user) {
        throw new Error('User not found');
    }

    const sftp = new Client();
    const baseDir = `/home/${user.username}/`; // Base directory for the user
    const sanitizedPath = pathFile.replace(/\/+$/, ''); // Remove trailing slashes

    if (sanitizedPath.includes('..')) {
      throw new Error('Invalid Path');
    }

    const filePath = path.join(baseDir, sanitizedPath); // Resolve full path

    try {
        await sftp.connect({
            host: process.env.host,
            port: process.env.port,
            username: user.username,
            password: user.password,
        });

        const fileDetails = await sftp.stat(filePath);

        return {
            name: path.basename(filePath),
            size: (fileDetails.size / (1024 * 1024)).toFixed(2), // Size in MB
            type: fileDetails.type === '-' ? 'file' : 'directory', // File type
            date: fileDetails.modifyTime ? new Date(fileDetails.modifyTime * 1000).toLocaleDateString() : 'N/A', // Modification date
        };
    } catch (error) {
        console.error('Error fetching file details:', error.message);
        throw new Error('Failed to fetch file details');
    } finally {
        await sftp.end();
    }
}


const fetchFolderContents = async (loginID, folderPath) => {
    // Fetch user based on the loginID from the database
    const user = await fetchUsersFromID(loginID);

    if (!user) {
        throw new Error('User not found');
    }

    const sftp = new Client();
    const baseDir = `/home/${user.username}/`; // Base directory for the user
    const sanitizedPath = folderPath.replace(/\/+$/, ''); // Remove trailing slashes

    if (sanitizedPath.includes('..')) {
        throw new Error('Invalid Path');
    }

    const fullPath = path.join(baseDir, sanitizedPath); // Resolve full path

    try {
        await sftp.connect({
            host: process.env.host,
            port: process.env.port,
            username: user.username,
            password: user.password,
        });

        // Fetch the list of files/folders from the specified directory
        const fileList = await sftp.list(fullPath);

        // Map and filter the result into a structured format
        const folderContents = fileList
            .filter((file) => !file.name.startsWith('.') && file.name !== 'trash') // Exclude hidden files and "trash" folder
            .map((file) => ({
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(2), // Size in MB
                type: file.type === '-' ? 'file' : 'directory', // File type
                date: file.modifyTime ? new Date(file.modifyTime * 1000).toLocaleDateString() : 'N/A', // Modification date
            }));

        return folderContents;
    } catch (error) {
        console.error('Error fetching folder contents:', error.message);
        throw new Error('Failed to fetch folder contents');
    } finally {
        await sftp.end();
    }
};


module.exports = {
  upload,
  handleSharedUpload,
  fetchFileDetails,
  handleSharedDownload,
  fetchFolderContents
};
