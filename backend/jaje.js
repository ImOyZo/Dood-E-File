const express = require('express');
const mysql = require('mysql2/promise'); // Using promise-based MySQL
const bodyParser = require('body-parser');
const app = express();

// MySQL database connection using promises
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'loginbase'
});

app.use(bodyParser.json());

// inserting records to the table
// i got lil bit confused, i decided to set the user capabilities to bolean. if the user can read the file, then it will true.

app.post('/permissions', async (req, res) => {
    const { user_id, file_id, role_id, can_read, can_write, can_delete } = req.body;
    try {
        const query = `
            INSERT INTO filePermission (user_id, file_id, role_id, can_read, can_write, can_delete)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE can_read = ?, can_write = ?, can_delete = ?
        `;
        const [result] = await db.execute(query, [
           user_id,  file_id, role_id, can_read, can_write, can_delete,
            can_read, can_write, can_delete
        ]);
        res.status(200).send('Permission updated successfully.');
    } catch (err) {
        res.status(500).send('Error saving permission: ' + err.message);
    }
});

// fetching all permission associated with the file.
// so i assumed that, the result of this will be integer of id, followed by boolean statement.

app.get('/permissions/:file_id', async (req, res) => {
    const file_id = req.params.file_id;
    try {
        const query = `SELECT * FROM filePermissions WHERE file_id = ?`;
        const [result] = await db.execute(query, [file_id]);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).send('Error fetching permissions: ' + err.message);
    }
});

// delete the permission from associated file

app.delete('/permissions', async (req, res) => {
    const { file_id, role_id } = req.body;
    try {
        const query = `DELETE FROM filePermissions WHERE file_id = ? AND role_id = ?`;
        const [result] = await db.execute(query, [file_id, role_id]);
        res.status(200).send('Permission deleted successfully.');
    } catch (err) {
        res.status(500).send('Error deleting permission: ' + err.message);
    }
});

// fetching all roles associated with the file

app.get('/roles', async (req, res) => {
    try {
        const query = 'SELECT * FROM roles';
        const [roles] = await db.execute(query);
        res.status(200).json(roles); // Return roles as JSON
    } catch (err) {
        res.status(500).send('Error fetching roles: ' + err.message);
    }
});

// modify permission 

app.put('/modify-file/:file_id', isAuthenticated, async (req, res) => {
    const { file_id } = req.params; // request parameters (file_id)
    const user_id = req.session.user.id; 
    const { can_read, can_write, can_delete } = req.body; // extracted from body, idk will this code work or nah

    try {
        const query = `
            SELECT * FROM filePermissions
            WHERE file_id = ? AND role_id IN (SELECT role_id FROM user_roles WHERE user_id = ?)
        `;
        const [permissions] = await db.execute(query, [file_id, user_id]);

        if (permissions.length > 0) {
            const permission = permissions[0]; // Assume first row is applicable
            if (can_read && !permission.can_read) {
                return res.status(403).send('Permission denied: No read access.');
            }
            if (can_write && !permission.can_write) {
                return res.status(403).send('Permission denied: No write access.');
            }
            if (can_delete && !permission.can_delete) {
                return res.status(403).send('Permission denied: No delete access.');
            }

            // Modify the file (update logic goes here)

            res.status(200).send('File modified successfully.');
        } else {
            res.status(403).send('Permission denied: User does not have access.');
        }
    } catch (err) {
        res.status(500).send('Error modifying file: ' + err.message);
    }
});


// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
