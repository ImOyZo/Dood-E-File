const { getLoginLogs } = require('../models/loginLogs');

// Handle fetching login logs
async function handleLoginLogs(req, res) {
    try {
        const userID = req.headers['user-id']; 
        const logs = await getLoginLogs(userID);

        // JSON
        res.status(200).json({
            success: true,
            message: 'Login logs fetched successfully',
            data: logs,
        });
    } catch (error) {
        console.error('Error in handleLoginLogs:', error);

        // ERR Handler
        res.status(500).json({
            success: false,
            message: 'Failed to fetch login logs',
        });
    }
}

module.exports = { handleLoginLogs };
