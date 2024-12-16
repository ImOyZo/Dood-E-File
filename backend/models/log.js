const db = require('../db'); // Database connection

// log ingpo 
async function addLoginLog({ userID, status, ipAddress }) {
    const query = `
        INSERT INTO login_logs (user_id, status, ip_address)
        VALUES (?, ?, ?)
    `;
    await db.execute(query, [userID, status, ipAddress]);
}

// Fetch all login log
async function getLoginLogs(userID = null) {
    const query = userID
        ? `SELECT * FROM login_logs WHERE user_id = ? ORDER BY timestamp DESC`
        : `SELECT * FROM login_logs ORDER BY timestamp DESC`;
    const [rows] = await db.execute(query, userID ? [userID] : []);
    return rows;
}

module.exports = { addLoginLog, getLoginLogs };
