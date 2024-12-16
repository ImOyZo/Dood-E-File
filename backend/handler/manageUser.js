// WIP
const Client = requre('ssh2');
const { fetchUsersFromID, fetchUserAdmin, fetchUsers, createUser, deleteUser, updateUser } = require('../models/users');

const ssh = new Client();

// Run SSH command;
function runSSHCommand(command) {
    return new Promise((resolve, reject) => {
        ssh.on('ready', () => {
            ssh.exec(command, (err, stream) => {
                if (err) {
                    reject(err);
                }
                let output = '';
                stream.on('data', (data) => {
                    output += data.toString();
                }).on('close', (code, signal) => {
                    ssh.end();
                    resolve(output);
                });
            });
        }).connect({
            host: 'localhost',  
            port: 22,  
            username: 'root',  
            privateKey: 'doodefile69'  
        });
    });
}

// Handle Linux and DB user Deletion;
const handleDeleteUser = async (req, res, userID) => {
    try {
        const user = await fetchUsersFromID(userID);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Run SSH command to delete Linux user
        const linuxDeletionResult = await runSSHCommand(`sudo userdel -r ${user.username}`);

        if (linuxDeletionResult) {
            // Proceed to delete the user from the database
            await deleteUser(userID);  // 
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to delete user from Linux system' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
};

// Handle Linux and DB user creation ;
const handleAddUser = async (req, res ) => {
    try {
        const userAddCommand = `sudo useradd -m ${username}`;
        const linuxUserCreation = await runSSHCommand(userAddCommand);

        if(linuxUserCreation){
            const passwordCommand = `echo ${username}:${password} | chpasswd`;
            const passwordSet = await runSSHCommand(passwordCommand);

            if(passwordSet){
                const newUserDB = await createUser(username, email, fullName, password, role);
                return res.json({ success: true, newUserDB});
            } else{
                return res.status(500).json({success: false, message: 'Failed to set user password'});
            }
        } else {
            return res.status(500).json({success: false, message:'Failed to create user'});
        }
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ success: false, message: 'Failed to add user' });
    }
}

// Handle Linux and DB user edit;
const handleEditUser = async (req, res, userID, username, fullName, email, password, role) => {

    try {
        const user = await fetchUsersFromID(userID);
    
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
    
        // SSH command to change linux Username and Password
        const editUserCommand = `sudo usermod -l ${username} ${user.username} && echo ${username}:${password} | chpasswd`;
        await runSSHCommand(editUserCommand);
    
        // Update user in the database
        const updatedUserDB = await updateUser(userID, username, email, fullName, password, role);
        res.json({ success: true, updatedUserDB });
    } catch (error) {
        console.error('Error editing user:', error);
        res.status(500).json({ success: false, message: 'Failed to edit user' });
    }
}

const handleFetchUser = async (req, res,) => {
    fetchUsers();
}


module.exports = {
    handleFetchUser,
    handleDeleteUser,
    handleAddUser,
    handleEditUser
};
