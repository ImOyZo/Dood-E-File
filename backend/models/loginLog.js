const { addLoginLog } = require('../models/loginLogs');
const db = require('../db'); // Example: for user validation

//NEED TO BE EVALUATE

//async function validateUser(username, password) {
  //  const query = `SELECT id FROM users WHERE username = ? AND password = ?`;
    //const [rows] = await db.execute(query, [username, password]);
    //return rows.length ? rows[0].id : null;
//}

// Diatas template doang


// Handle login
async function handleLogin(req, res) {
    const { username, password } = req.body;
    const ipAddress = req.ip; // gtw ni mau apa ngga ya woakaka

    try {
        const userID = await validateUser(username, password);

        if (userID) {
            // Log success
            await addLoginLog({ userID, status: 'Login Success', ipAddress });
            console.log(`User ${userID} logged in successfully from IP: ${ipAddress}`);
            res.status(200).json({ success: true, message: 'Login successful', userID });
        } else {
            // Log failed
            await addLoginLog({ userID: null, status: 'Login Failed', ipAddress });
            console.log(`Failed login attempt from IP: ${ipAddress}`);
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error in handleLogin:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = { handleLogin }; //export
