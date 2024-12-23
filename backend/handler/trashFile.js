const { exec } = require('child_process')
const { fetchUsersFromID } = require('../models/users');
const Client = require('ssh2-sftp-client')
const { deleteFile } = require('../models/file');
const { createLog } = require('../models/activityLog'); 
const path = require('path');
require('dotenv').config()


const sftp = new Client();
const handleListTrash = async (req, res, id) => {
    const user = await fetchUsersFromID(id);

    if (!user) {
      console.error('User not found for ID:', id);
      return res.status(404).send('User not found');
    }

    console.log('User fetched:', user); 

    const sftp = new Client();
    const baseDir = `/home/${user.username}/trash`; // Remote directory to list files
    let remoteDir = req.query.path || '';

    remoteDir = remoteDir.replace(/\/+$/, '');  // Remove trailing slashes
    console.log('Sanitized path:', remoteDir);  // For debugging

    if (remoteDir.includes('..')) {
        return res.status(400).send('Invalid Path');
    }

    const fullPath = path.join(baseDir, remoteDir);
    console.log('Full path for listing files:', fullPath);


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
        .map((file) => ({
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2),
            type: file.type === '-' ? 'file' : 'directory',
            date: file.modifyTime ? new Date(file.modifyTime).toLocaleDateString() : 'N/A',
        }));

        res.json(files); // Send the list of files as JSON

    } catch (err) {
        console.error('Error listing files:', err.message);
        res.status(500).send('Failed to list files.');
    } finally {
        await sftp.end();
    }
}

const handleMoveTrash = async (req, res, fileName, id) => {
    const user = await fetchUsersFromID(id);
    const path = req.query.path || '/';
    console.log(user);
    if (!id || !fileName) {
        return res.status(400).send('Missing userID or filename');
    }
    const oldPath = `/home/${user.username}${path}/${fileName.replace(/'/g, "\\'")}`;
    const trashPath = `/home/${user.username}/trash`;
    
    const command = `mv "${oldPath}" "${trashPath}"`
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${stderr}`);
            return res.status(500).send('Failed to delete file via SSH.');
        }

        console.log(`File deleted: ${stdout}`);
        return res.status(200).send('File deleted successfully.');

    });
    await createLog(id, id, `Moved file to trash: ${fileName}`);
}

const HandleRecoverFromTrash = async (req, res,fileName, id) => {
    const user = await fetchUsersFromID(id);
    const path = req.query.path || '/';

    if (!id || !fileName) {
        return res.status(400).send('Missing userID or filename');
    }

    if (!user) {
        return res.status(404).send('User not found');
    }
    const oldPath = `/home/${user.username}${path}/trash/${fileName.replace(/'/g, "\\'")}`;
    const newPath = `/home/${user.username}/`;

    const command = `mv "${oldPath}" "${newPath}"`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${stderr}`);
            return res.status(500).send('Failed to delete file via SSH.');
        }

        console.log(`File deleted: ${stdout}`);
        return res.status(200).send('File deleted successfully.');
    });
}

// Endpoint to delete a file from the remote server
const handleFileDelete = async (req, res, fileName, id) => {

    if (!id || !fileName) {
        return res.status(400).send('Missing userID or filename');
    };

    // Fetch user details based on the userID
    const user = await fetchUsersFromID(id);
    if (!user) {
        return res.status(404).send('User not found');
    }
    
    await deleteFile(id, fileName);

    const trashDir = `/home/${user.username}/trash/${fileName.replace(/'/g, "\\'")}`;
    const command = `rm -rf "${trashDir}"`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${stderr}`);
            return res.status(500).send('Failed to delete file via SSH.');
        }
        console.log(`File deleted: ${stdout}`);
        return res.status(200).send('File deleted successfully.');
    });
    await createLog(id, id, `Deleted file: ${fileName}`);
 
        
};

module.exports = {
    handleListTrash,
    handleFileDelete,
    handleMoveTrash,
    HandleRecoverFromTrash
};

