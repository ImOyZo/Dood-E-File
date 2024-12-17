//===========================================================================================\\
// PLEASE HANDLE THIS CODE CAREFULLY AS REQUEST / COMMAND CAN BE DIRECTLY SENT TO MAIN SERVER \\   
//===========================================================================================\\

const { exec } = require('child_process');
const { fetchUsersFromID, fetchUserAdmin, fetchUsers, createUser, deleteUser, updateUser } = require('../models/users');

// Create Linux User
function createLinuxUser(username, password, callback) {
    // Create the user
    exec(`sudo useradd -m ${username}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error creating user: ${error.message}`);
            return callback(error, null);
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return callback(stderr, null);
        }
        console.log(`User ${username} created successfully.`);

        // Set password for the user
        exec(`echo "${username}:${password}" | sudo chpasswd`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error setting password: ${error.message}`);
                return callback(error, null);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return callback(stderr, null);
            }
            console.log(`Password for ${username} set successfully.`);
            callback(null, stdout);
        });
    });
}

// Edit Linux User and Password
function editLinuxUser(oldUsername, newUsername, password, callback) {
    // Change username
    exec(`sudo usermod -l ${newUsername} ${oldUsername}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error editing user: ${error.message}`);
            return callback(error, null);
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return callback(stderr, null);
        }
        console.log(`Username changed from ${oldUsername} to ${newUsername} successfully.`);

        // Set new password
        exec(`echo "${newUsername}:${password}" | sudo chpasswd`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error setting new password: ${error.message}`);
                return callback(error, null);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return callback(stderr, null);
            }
            console.log(`Password for ${newUsername} set successfully.`);
            callback(null, stdout);
        });
    });
}

// Delete Linux User
function deleteLinuxUser(username, callback) {
    exec(`sudo userdel -r ${username}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error deleting user: ${error.message}`);
            return callback(error, null);
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return callback(stderr, null);
        }
        console.log(`User ${username} deleted successfully.`);
        callback(null, stdout);
    });
}

// Handle Linux and DB user Deletion
const handleDeleteUser = async (req, res, userID) => {
    try {
        const user = await fetchUsersFromID(userID);


        // Delete user from the Linux system
        deleteLinuxUser(user.username, (error, result) => {
            if (error) {
                return res.status(500).json({ success: false, message: 'Failed to delete user from Linux system' });
            }

            // Proceed to delete the user from the database
            deleteUser(userID);  
            res.json({ success: true });
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
};

// Handle Linux and DB user creation
const handleAddUser = async (req, res, username, fullName, email, password, role) => {
    try {
        createLinuxUser(username, password, (error, result) => {
            if (error) {
                console.log('Error creating Linux user:', error);
                return res.status(500).json({ success: false, message: 'Failed to create Linux user' });
            }
            console.log('Linux user created and password set successfully!');
        });

        const newUserDB = await createUser(username, email, fullName, password, role);
        return res.json({ success: true, newUserDB });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: 'Failed to create user in the database' });
    }
};

// Handle Linux and DB user edit
const handleEditUser = async (req, res, userID, username, fullName, email, password, role) => {
    try {
        const user = await fetchUsersFromID(userID);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        editLinuxUser(user.username, username, password, (error, result) => {
            if (error) {
                console.log('Error editing Linux user:', error);
                return res.status(500).json({ success: false, message: 'Failed to edit Linux user' });
            }
            console.log('Linux user edited successfully!');
        });

        // Update user in the database
        const updatedUserDB = await updateUser(userID, username, email, fullName, password, role);
        res.json({ success: true, updatedUserDB });
    } catch (error) {
        console.error('Error editing user:', error);
        res.status(500).json({ success: false, message: 'Failed to edit user in the database' });
    }
};

// Fetch user data by ID
const handleFetchUserData = async (req, res, userID) => {
    try {
        const user = await fetchUsersFromID(userID);
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user data' });
    }
};

// Fetch all users
const handleFetchUser = async (req, res) => {
    try {
        const users = await fetchUsers();
        if (users) {
            res.json(users);
        } else {
            res.status(404).json({ success: false, message: 'No users found' });
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
};

module.exports = {
    handleFetchUser,
    handleFetchUserData,
    handleDeleteUser,
    handleAddUser,
    handleEditUser,
};
