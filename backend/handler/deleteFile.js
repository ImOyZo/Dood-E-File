const Client = require('ssh2-sftp-client');
require('dotenv').config();
const { fetchUsersFromID } = require('../models/users');

// Endpoint to delete a file from the remote server
const handleFileDelete = async (req, res) => {
    const filename = req.params.filename; // Get the filename from the route params
    const userID = req.headers['user-id'];

    if (!userID || !filename) {
        return res.status(400).send('Missing userID or filename');
    }

    const sftp = new Client();

    try {
        // Fetch user details based on the userID
        const user = await fetchUsersFromID(userID);
        if (!user) {
            return res.status(404).send('User not found');
        }

        const remotePath = `/home/${user.username}/${filename}`; // File path on the remote server

        await sftp.connect({
            host: process.env.host,
            port: process.env.port,
            username: user.username,
            password: user.password,
        });

        // Delete the file on the remote server
        await sftp.delete(remotePath);
        console.log(`File "${remotePath}" deleted successfully.`);

        res.status(200).send(`File "${filename}" deleted successfully.`);
    } catch (err) {
        console.error('Error deleting file:', err.message);
        res.status(500).send(`Failed to delete file: ${err.message}`);
    } finally {
        await sftp.end();
    }
};

module.exports = {
    handleFileDelete,
};
