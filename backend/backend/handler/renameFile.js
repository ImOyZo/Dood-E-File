const Client = require('ssh2-sftp-client');
const path = require('path');
require('dotenv').config();

const handleRenameFile = async (req, res) => {
    const sftp = new Client();
    const { newName, oldFilePath } = req.body;

    // Add a debug log to verify the received request body
    console.log('Received request body:', req.body);

    // Validate the input data
    if (!newName || !oldFilePath) {
        return res.status(400).json({ message: 'Invalid data, missing parameters.' });
    }

    const oldName = path.basename(oldFilePath);
    const baseDir = `/home/${process.env.username}/`;
    const newFilePath = path.join(baseDir, path.dirname(oldFilePath) + '/' + newName);

    if (oldFilePath.includes('..') || newFilePath.includes('..')){
        return res.status(400).send('invalid path');
    }

    try {
        await sftp.connect({
            host: process.env.host,
            port: process.env.port,
            username: process.env.username,
            password: process.env.password
        });

        // Attempt to rename the file
        await sftp.rename(oldFilePath, newFilePath);
        res.status(200).json({ message: 'File renamed successfully!' });

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'Error renaming file', error: err.message });
    } finally {
        await sftp.end();
    }
}

module.exports = {
    handleRenameFile,
}