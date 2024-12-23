const path = require('path');
const Client = require('ssh2-sftp-client');
const { fetchUsersFromID } = require('../models/users');
require('dotenv').config();


const calculateDirectorySize = async (sftp, dirPath) => {
    let totalSize = 0;

    try {
        const items = await sftp.list(dirPath);

        for (const item of items) {
            const itemPath = path.join(dirPath, item.name);

            if (item.type === '-') {
                // It's a file, add its size
                totalSize += item.size;
            } else if (item.type === 'd') {
                // It's a directory, recursively calculate its size
                totalSize += await calculateDirectorySize(sftp, itemPath);
            }
        }
    } catch (error) {
        console.error(`Error calculating size for directory ${dirPath}:`, error.message);
    }

    return totalSize;
};

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
    const searchQuery =  req.query.search;
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
        const files = await Promise.all(
            fileList
                .filter(
                    (file) =>
                        !file.name.startsWith('.') &&
                        file.name !== 'trash' &&
                        file.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(async (file) => {
                    const fileSize =
                        file.type === 'd'
                            ? (await calculateDirectorySize(sftp, path.join(fullPath, file.name))) / (1024 * 1024)
                            : file.size / (1024 * 1024);

                    return {
                        name: file.name,
                        size: fileSize.toFixed(2),
                        type: file.type === '-' ? 'file' : 'directory',
                        date: file.modifyTime
                            ? new Date(file.modifyTime).toLocaleDateString()
                            : 'N/A',
                    };
                })
        );


        res.json(files); // Send the list of files as JSON
    } catch (err) {
        console.error('Error listing files:', err.message);
        res.status(500).send('Failed to list files.');
    } finally {
        await sftp.end();
    }
};

const handlePreview = async (req, res, id) => {
    console.log('Preview request');
    const user = await fetchUsersFromID(id);

    const baseDir = `/home/${user.username}/`;
    let remoteDir = req.query.path || '';
    let fileName = req.query.file || '';

    remoteDir = remoteDir.replace(/\/+$/, '');  // Remove trailing slashes
    console.log('Sanitized path', remoteDir);  // For debugging

    if (!user) {
        console.error('User not found for ID:', id);
        return res.status(404).send('User not found');
    }

    const sftp = new Client();
    const fullPath = path.join(baseDir, remoteDir);
    console.log('Full path:', fullPath);

    const filePath = path.join(fullPath, fileName); 
    console.log('File path:', filePath);

    if (!filePath || filePath.includes('..')) {
        return res.status(400).send('Invalid File Path');
    }

    try {
        await sftp.connect({
            host: process.env.host,
            port: process.env.port,
            username: user.username,
            password: user.password,
        });

        const fileStat = await sftp.stat(filePath);
        const mime = await import('mime');
        const mimetype = fileStat.isDirectory ? null : mime.default.getType(filePath) || 'application/octet-stream';

        const metadata = {
            name: path.basename(filePath),
            size: (fileStat.size / (1024 * 1024)).toFixed(2), // Size in MB
            type: fileStat.isDirectory ? 'directory' : 'file',
            modifyTime: fileStat.modifyTime ? new Date(fileStat.modifyTime).toLocaleString() : 'N/A',
            mimeType : mimetype,
        };

        if (fileStat.isDirectory) {
            // For directories, list contents
            const fileList = await sftp.list(filePath);
            metadata.contents = fileList.map((file) => ({
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(2),
                type: file.type === '-' ? 'file' : 'directory',
                modifyTime: file.modifyTime ? new Date(file.modifyTime).toLocaleDateString() : 'N/A',
            }));
            res.json(metadata);
        } else {
            // For file to handle PDF, image, and text files
            const fileContent = await sftp.get(filePath);

            if (metadata.mimeType.startsWith('image/')) {
                // Send image binary content
                res.setHeader('Content-Type', metadata.mimeType);
                res.send(fileContent);  // Send image or binary content directly
            } else if (metadata.mimeType === 'application/pdf') {
                // Send PDF binary content 
                res.setHeader('Content-Type', 'application/pdf');
                res.send(fileContent);  // Send PDF content directly
            } else {
                // Text content, send metadata with preview
                metadata.preview = fileContent.toString('utf8').substring(0, 500); // First 500 characters for text
                res.json(metadata);  // Send metadata as JSON for text files
            }
        }
    } catch (err) {
        console.error('Error fetching preview:', err.message);
        res.status(500).send('Failed to fetch preview.');
    } finally {
        await sftp.end();
    }
};

module.exports = {
    handleFileList,
    handlePreview,
};
