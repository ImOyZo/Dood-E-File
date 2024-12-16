const path = require('path');
const Client = require('ssh2-sftp-client');
const { fetchUsersFromID } = require('../models/users');
require('dotenv').config();

// Endpoint to list files from the remote server
const sortFileName = async (req, res, id) => {
    // Fetch user based on the hardcoded id
    const user = await fetchUsersFromID(id);

    if (!user) {
      console.error('User not found for ID:', id);
      return res.status(404).send('User not found');
    }

    console.log('User fetched:', user); 

    const sftp = new Client();
    const baseDir = `/home/${user.username}/`; // Remote directory to list files
    let remoteDir = req.query.path || '';

    remoteDir = remoteDir.replace(/\/+$/, '');  // Remove trailing slashes
    console.log('Sanitized path:', remoteDir);  // For debugging

    if (remoteDir.includes('..')) {
        return res.status(400).send('Invalid Path');
    }

    const fullPath = path.join(baseDir, remoteDir);

    try {
        await sftp.connect({
            host: process.env.host,
            port: process.env.port,
            username: user.username,
            password: user.password,
        });

        const fileList = await sftp.list(fullPath);

        console.log('Full path:', fullPath);

        // Map the files to a JSON structure
        const files = fileList.map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type === '-' ? 'file' : 'directory',
            date: file.modifyTime ? new Date(file.modifyTime * 1000).toLocaleDateString() : 'N/A',
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
    sortFileName,
};
