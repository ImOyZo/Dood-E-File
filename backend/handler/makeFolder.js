const { fetchUsersFromID } = require('../models/users'); 
const { createFolder } = require('../models/folder'); 
const { createLog } = require('../models/activityLog'); 
const Client = require('ssh2-sftp-client');

// Function to create a remote directory
const handleMakeDirectory = async (req, res, folderName, id) => {
  const user = await fetchUsersFromID(id);
  const sftp = new Client();
  const  path = req.query.path || '/';

  // Define the directory to be created
  const remoteDirPath = `/home/${user.username}${path}/${folderName}`;

  console.log('Creating directory at:', remoteDirPath);

  try {
    // Connect to the SFTP server
    await sftp.connect({
      host: process.env.host,
      port: process.env.port,
      username: user.username,
      password: user.password,
    });

    // Create the directory
    await sftp.mkdir(remoteDirPath, false); // true for recursive creation if needed
    console.log(`Created directory at: ${remoteDirPath}`);

    await createFolder(folderName, id, remoteDirPath);

    const dateString = new Date().toLocaleDateString();
    await createLog(id, id, `Created directory: ${folderName}`, dateString);

    res.send(`Directory created successfully at: ${remoteDirPath}`);
  } catch (err) {
    console.error('Error creating directory:', err.message);
    res.status(500).send('Failed to create directory.');
  } finally {
    await sftp.end();
  }
};

module.exports = {
  handleMakeDirectory,
};
