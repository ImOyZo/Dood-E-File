import mysql from "mysql2";

import dotenv from "dotenv";
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERS,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
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

async function createUser(username, email, password, role) {
    try {
        const [result] = await pool.query(`
            INSERT INTO users (username, email, password, role)
            VALUES (?, ?, ?, ?)
            `, [username, email, password, role])
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

async function updateUser(id, username, email, password, role, usedStorage) {
    try {
        const [result] = await pool.query(`
            UPDATE users 
            SET username = ?, email = ?, password = ?, role = ?, usedStorage = ?
            WHERE userID = ?
            `, [username, email, password, role, usedStorage, id])
        return result
    } catch (error) {
        console.error(error)
        return error
    }
}