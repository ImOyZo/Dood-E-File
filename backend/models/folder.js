const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'doodefile69',
    database: 'doode_file'
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
    const normalizedPath = path.replace(/\/\//g, '/');

    try {
        const [result] = await pool.query(`
            INSERT INTO folder (folderName, ownerID, path)
            VALUES (?, ?, ?)
            `, [folderName, ownerID, normalizedPath])
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

module.exports = {
    fetchFolder,
    updateFolder,
    deleteFolder,
    createFolder
}