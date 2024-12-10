import mysql from "mysql2";

import dotenv from "dotenv";
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERS,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

async function fetchFiles(ownerID) {
    try {
        const [result] = await pool.query(`
            SELECT * FROM file 
            WHERE ownerID = ?
            `, [ownerID])
        return result
    } catch (error) {
        console.error(error)
        return error
    }
}

async function fetchFile(ownerID, fileName) {
    try {
        const [result] = await pool.query(`
            SELECT *
            FROM file
            WHERE ownerID = ? AND fileName = ?
            `, [ownerID, fileName])
        return result[0]
    } catch (error) {
        console.error(error)
        return error
    }
}

async function createFile(fileName, fileType, fileSize, ownerID) {
    try {
        const [result] = await pool.query(`
            INSERT INTO file (fileName, fileType, fileSize, ownerID)
            VALUES (?, ?, ?, ?)
            `, [fileName, fileType, fileSize, ownerID])
        return fetchFile(ownerID, fileName)
    } catch (error) {
        console.error(error)
        return error
    }
}

async function deleteFile(ownerID, fileName) {
    try {
        const [result] = await pool.query(`
            DELETE FROM file
            WHERE ownerID = ? AND fileName = ?
            `, [ownerID, fileName])
        return result
    } catch (error) {
        console.error(error)
        return error
    }
}

async function updateFile(ownerID, oldFileName, newFileName) {
    try {
        const [result] = await pool.query(`
            UPDATE file 
            SET fileName = ?
            WHERE ownerID = ? AND fileName = ?
            `, [newFileName, ownerID, oldFileName])
        return result
    } catch (error) {
        console.error(error)
        return error
    }
}