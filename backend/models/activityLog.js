import mysql from "mysql2";

import dotenv from "dotenv";
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERS,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

async function fetchLogs(userID) {
    try {
        const [result] = await pool.query(`
            SELECT * FROM activityLog 
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
            SELECT * FROM activityLog 
            WHERE ownerID = ? AND actionType = ?
            `, [ownerID, actionType])
        return result
    } catch (error) {
        console.error(error)
        return error
    }
}

async function createLog(userID, targetID, actionType) {
    try {
        const [result] = await pool.query(`
            INSERT INTO activityLog (userID, targetID, actionType)
            VALUES (?, ?, ?)
            `, [userID, targetID, actionType])
        return result
    } catch (error) {
        console.error(error)
        return error
    }
}

async function deleteLog(logID) {
    try {
        const [result] = await pool.query(`
            DELETE FROM activityLog
            WHERE logID = ?
            `, [logID])
        return result
    } catch (error) {
        console.error(error)
        return error
    }
}