// Still not working
const Client = require('ssh2-sftp-client');
const { fetchUsersFromID } = require('../models/users');
const { fetchStarred } = require('../models/file'); // Add this function to fetch starred files from the DB
require('dotenv').config();

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
            return res.status(404).json({ message: 'No starred files found.' });
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
                    name: file.name,
                    path: filePath,
                    size: stats.size,
                    date: new Date(stats.modifyTime * 1000).toLocaleDateString(),
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
};
