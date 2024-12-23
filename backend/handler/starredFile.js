// Still not working
const Client = require('ssh2-sftp-client');
const { fetchUsersFromID } = require('../models/users');
const { fetchStarred, updateStarredFalse, updateStarredTrue } = require('../models/file'); 
const { createLog } = require('../models/activityLog'); 
require('dotenv').config();

const handleTrueStarred = async (req, res, fileName, id) => {
    try {
        const user = await fetchUsersFromID(id);
        if (!user) {
            console.error('User not found for ID:', id);
            return res.status(404).send('User not found');
        }

        console.log('User fetched:', user);        

        await updateStarredTrue(id, fileName);
        res.send('File starred successfully!');
        const dateString = new Date().toLocaleDateString();
        await createLog(id, id, `Starred file: ${fileName}`, dateString);

    } catch (err) {
        console.error('Error fetching starred files:', err.message);
        res.status(500).send('Failed to fetch starred files.');
    }

};

const handleFalseStarred = async (req, res, fileName, id) => {
    try {
        const user = await fetchUsersFromID(id);
        if (!user) {
            console.error('User not found for ID:', id);
            return res.status(404).send('User not found');
        }

        console.log('User fetched:', user);        

        await updateStarredFalse(id, fileName);
        const dateString = new Date().toLocaleDateString();
        await createLog(id, id, `Unstarred file: ${fileName}`, dateString);
        res.send('File unstarred successfully!');
    } catch (err) {
        console.error('Error fetching starred files:', err.message);
        res.status(500).send('Failed to fetch starred files.');
    }
};

const handleStarredFile = async (req, res, id) => {
    try {
        // Step 1: Fetch user based on ID
        const user = await fetchUsersFromID(id);
        if (!user) {
            console.error('User not found for ID:', id);
            return res.status(404).send('User not found');
        }

        console.log('User fetched:', user);

        // Step 2: Query the database for starred files
        const starredFiles = await fetchStarred(id); // Fetch starred files for this user
        if (!starredFiles || starredFiles.length === 0) {
            console.warn('No starred files found in the database.');
            return res.status(200).json([]);
        }

        console.log('Starred files fetched from DB:', starredFiles);

        // Step 3: Connect to SFTP
        const sftp = new Client();
        await sftp.connect({
            host: process.env.host,
            port: process.env.port,
            username: user.username,
            password: user.password,
        });

        // Step 4: Verify the existence of files and prepare the response
        const verifiedFiles = [];
        for (const file of starredFiles) {
            const filePath = file.path; // Assuming 'path' column stores the full path
            try {
                const stats = await sftp.stat(filePath); // Check if the file exists on SFTP
                verifiedFiles.push({
                    name: file.fileName,
                    path: filePath,
                    size: (stats.size / (1024 * 1024)).toFixed(2),
                    date: new Date(stats.modifyTime).toLocaleDateString(),
                });

            } catch (err) {
                console.warn(`File not found on SFTP: ${filePath}`); // Skip if file doesn't exist
            }
        }

        // Step 5: Close the SFTP connection and send the response
        await sftp.end();

        if (verifiedFiles.length === 0) {
            return res.status(404).json({ message: 'No valid starred files found on the server.' });
        }

        res.json(verifiedFiles);
    } catch (err) {
        console.error('Error fetching starred files:', err.message);
        res.status(500).send('Failed to fetch starred files.');
    }
};

module.exports = {
    handleStarredFile,
    handleTrueStarred,
    handleFalseStarred,
};
