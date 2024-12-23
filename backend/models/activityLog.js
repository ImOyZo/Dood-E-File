const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'doodefile69',
    database: 'doode_file'
}).promise()

async function fetchLogs(userID) {
    try {
        const [result] = await pool.query(`
            SELECT * FROM activitylog 
            WHERE userID = ?
            `, [userID])
        return result
    } catch (error) {
        console.error(error)
        return error
    }
}

async function fetchLogAction(ownerID, actionType) {
    try {
        const [result] = await pool.query(`
            SELECT * FROM activitylog 
            WHERE ownerID = ? AND actionType = ?
            `, [ownerID, actionType])
        return result
    } catch (error) {
        console.error(error)
        return error
    }
}

async function createLog(userID, targetID, actionType, actionDate) {
    try {
        const [result] = await pool.query(`
            INSERT INTO activitylog (userID, targetID, actionType, actionDate)
            VALUES (?, ?, ?, ?)
            `, [userID, targetID, actionType, actionDate])
        return result
    } catch (error) {
        console.error(error)
        return error
    }
}

async function deleteLog(logID) {
    try {
        const [result] = await pool.query(`
            DELETE FROM activitylog
            WHERE logID = ?
            `, [logID])
        return result
    } catch (error) {
        console.error(error)
        return error
    }
}

module.exports = {
    fetchLogs,
    deleteLog, 
    createLog, 
    fetchLogAction,
    
}