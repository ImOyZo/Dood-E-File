const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'doodefile69',
    database: 'doode_file'
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

async function fetchFile(ownerID, fileName, path) {
    try {
        const [result] = await pool.query(`
            SELECT *
            FROM file
            WHERE ownerID = ? AND fileName = ? AND path =?
            `, [ownerID, fileName, path])
        return result[0]
    } catch (error) {
        console.error(error)
        return error
    }
}

async function fetchFilePath(path) {
    try {
        const [result] = await pool.query(`
            SELECT * 
            FROM file
            WHERE path = ?
            `, [path])
        return result[0]
    } catch (err){
        console.err(err)
        return(err)
    }
}

async function fetchStarred(ownerID) {
    try {
        const [result] = await pool.query(`
            SELECT *
            FROM file
            WHERE ownerid = ? AND starred = TRUE
            `, [ownerID])
        return result[0]
    } catch (error) {
        console.error(error)
        return error
    }
}

async function createFile(fileName, fileSize, ownerID, path) {
    try {
        const [result] = await pool.query(`
            INSERT INTO file (fileName, fileSize, ownerID, path) VALUES (?, ?, ?,?)`
            , [fileName, fileSize, ownerID, path])
        return fetchFile(ownerID, fileName)
    } catch (error) {
        console.error(error)
        return error
    }
}

async function deleteFile(ownerID, fileName, path) {
    try {
        const [result] = await pool.query(`
            DELETE FROM file
            WHERE ownerID = ? AND fileName = ? AND path = ?
            `, [ownerID, fileName, path])
        return result
    } catch (error) {
        console.error(error)
        return error
    }
}

async function updateFile(ownerID, oldFileName, newFileName, path) {
    try {
        const [result] = await pool.query(`
            UPDATE file 
            SET fileName = ?, path = ?
            WHERE ownerID = ? AND fileName = ?
            `, [newFileName, path, ownerID, oldFileName])
        return result
    } catch (error) {
        console.error(error)
        return error
    }
}

module.exports = {
    fetchFile,
    updateFile,
    deleteFile,
    createFile,
    fetchStarred,
    fetchFilePath
}