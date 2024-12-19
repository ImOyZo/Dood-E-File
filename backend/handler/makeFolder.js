const { fetchUsersFromID } = require('../models/users'); // Assuming this exists
const Client = require('ssh2-sftp-client');

// Function to create a remote directory
const handleMakeDirectory = async (req, res, folderName, id) => {
  const user = await fetchUsersFromID(id);
  const sftp = new Client();

  // Define the directory to be created
  const remoteDirPath = `/home/${user.username}/${folderName}`;

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
