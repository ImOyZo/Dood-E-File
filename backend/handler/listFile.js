const path = require('path');
const Client = require('ssh2-sftp-client');
const { fetchUsersFromID } = require('../models/users');
require('dotenv').config();

// Endpoint to list files from the remote server
const handleFileList = async (req, res, id) => {
    // Fetch user based on the id in DB
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
        const files = fileList
        .filter((file) => !file.name.startsWith('.',)&& file.name != 'trash')
        .map((file) => ({
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2),
            type: file.type === '-' ? 'file' : 'directory',
            date: file.modifyTime ? new Date(file.modifyTime * 1000).toLocaleDateString() : 'N/A', //tanya wahyu besok
        }));

// sorting algorithm

       //const sortBy = req.query.sortBy || 'name'; // Default sort by name
      //  if (sortBy === 'name') {
     //       files.sort((a, b) => a.name.localeCompare(b.name));
    //    } else if (sortBy === 'size') {
   //         files.sort((a, b) => a.size - b.size);
  //      } else if (sortBy === 'date') {
 //           files.sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest files first
//        }


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
