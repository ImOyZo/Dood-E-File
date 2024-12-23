const Client = require('ssh2-sftp-client');
const { fetchUsersFromID } = require('../models/users');
const { fetchFilePath } = require('../models/file');
const pathModule = require('path');
require('dotenv').config();

const handleRenameFile = async (req, res, path, newName, oldFileName, id) => {
    const user = await fetchUsersFromID(id);
    const sftp = new Client();
    const baseDir = `/home/${user.username}${path}/`

    // const remoteDir = path;
    // remoteDir = remoteDir.replace(/\/+$/, '');  // Remove trailing slashes
    console.log('Base Directory:', baseDir);
    const oldFilePath = pathModule.join(baseDir, oldFileName);
    console.log('Old File Location: ', oldFilePath)


    try {

        if (!path || !newName || !id) {
            return res.status(400).json({ message: "Missing required fields: path, newName, or userID." });
        }


        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Fetch file path details from DB
        const fileDetails = await fetchFilePath(oldFilePath);
        if (!fileDetails || !fileDetails.path) {
            return res.status(404).json({ message: "File not found in the database." });
        }

        const newFilePath = pathModule.join(baseDir, newName); 

        await sftp.connect({
            host: process.env.host,
            port: process.env.port,
            username: user.username,
            password: user.password,
        });

        const existingFiles = await sftp.list(baseDir);
        if (existingFiles.some(file => file.name === newName)) {
            return res.status(400).json({ message: "A file with the new name already exists." });
        }

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