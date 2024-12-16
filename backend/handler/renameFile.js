const Client = require('ssh2-sftp-client');
const { fetchUsersFromID } = require('../models/users');
const { fetchFilePath } = require('../models/file');
const pathModule = require('path');
require('dotenv').config();

const handleRenameFile = async (req, res, id) => {
    const sftp = new Client();

    try {
        const { path, newName, userID } = req.body;

        if (!path || !newName || !userID) {
            return res.status(400).json({ message: "Missing required fields: path, newName, or userID." });
        }

        const user = await fetchUsersFromID(id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Fetch file path details from DB
        const fileDetails = await fetchFilePath(path);
        if (!fileDetails || !fileDetails.path) {
            return res.status(404).json({ message: "File not found in the database." });
        }

        const oldFilePath = fileDetails.path; 
        const directory = pathModule.dirname(oldFilePath); 
        const newFilePath = pathModule.join(directory, newName); 

        await sftp.connect({
            host: process.env.host,
            port: process.env.port,
            username: user.username,
            password: user.password,
        });

        // Rename the file on the server
        await sftp.rename(oldFilePath, newFilePath);

        res.status(200).json({ 
            message: "File renamed successfully!",
            oldPath: oldFilePath,
            newPath: newFilePath
        });

    } catch (err) {
        console.error("Error during file rename:", err);
        res.status(500).json({ message: "Error renaming file", error: err.message });
    } finally {
        await sftp.end();
    }
};

module.exports = {
    handleRenameFile,
}