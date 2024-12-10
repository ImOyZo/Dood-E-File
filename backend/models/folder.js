import mysql from "mysql2";

import dotenv from "dotenv";
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERS,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

async function fetchFolders(ownerID) {
    try {
        const [result] = await pool.query(`
            SELECT * FROM folder 
            WHERE ownerID = ?
            `, [ownerID])
        return result
    } catch (error) {
        console.error(error)
        return error
    }
}

async function fetchFolder(ownerID, folderName) {
    try {
        const [result] = await pool.query(`
            SELECT *
            FROM folder
            WHERE ownerID = ? AND folderName = ?
            `, [ownerID, folderName])
        return result[0]
    } catch (error) {
        console.error(error)
        return error
    }
}

async function createFolder(folderName, ownerID, path) {
    try {
        const [result] = await pool.query(`
            INSERT INTO folder (folderName, ownerID, path)
            VALUES (?, ?, ?)
            `, [folderName, ownerID, path])
        return fetchFolder(ownerID, folderName)
    } catch (error) {
        console.error(error)
        return error
    }
}

async function deleteFolder(ownerID, folderName) {
    try {
        const [result] = await pool.query(`
            DELETE FROM folder
            WHERE ownerID = ? AND folderName = ?
            `, [ownerID, folderName])
        return result
    } catch (error) {
        console.error(error)
        return error
    }
}

async function updateFolder(ownerID, oldFolderName, newFolderName, path) {
    try {
        const [result] = await pool.query(`
            UPDATE folder
            SET folderName = ?, path = ?
            WHERE ownerID = ? AND folderName = ?
            `, [newFolderName, path, ownerID, oldFolderName])
        return result
    } catch (error) {
        console.error(error)
        return error
    }
}