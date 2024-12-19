const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'doodefile69',
    database: 'doode_file'
}).promise()

async function fetchUsers() {
    try {
        const [result] = await pool.query("SELECT * FROM users")
        return result
    } catch (error) {
        console.error(error)
        return error
    }
}

async function fetchUserFromEmail(email) {
    try {
        const [result] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        return result[0]; 
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function fetchUsersFromID(id) {
    try {
        const [result] = await pool.query(`
            SELECT *
            FROM users
            WHERE userID = ?
            `, [id])
        return result[0]
    } catch (error) {
        console.error(error)
        return error
    }
}

async function createUser(username,fullName, email, password, role) {
    try {
        const [result] = await pool.query(`
            INSERT INTO users (username, fullName, email, password, role)
            VALUES (?, ?, ?, ?, ?)
            `, [username, fullName, email, password, role])
        const id = result.insertId
        return fetchUsersFromID(id)
    } catch (error) {
        console.error(error)
        return error
    }
}

async function deleteUser(id) {
    try {
        const [result] = await pool.query(`
            DELETE FROM users
            WHERE userID = ? 
            `, [id])
        return result
    } catch (error) {
        console.error(error)
        return error
    }
}

async function updateUser(id, username, fullName, email, password, role) {
    try {
        const [result] = await pool.query(`
            UPDATE users 
            SET username = ?, fullName = ?, email = ?, password = ?, role = ?
            WHERE userID = ?
            `, [username, fullName, email, password, role, id])
        return result
    } catch (error) {
        console.error(error)
        return error
    }
}

module.exports = {
    fetchUsers,
    fetchUserFromEmail,
    fetchUsersFromID,
    updateUser,
    deleteUser,
    createUser,
};