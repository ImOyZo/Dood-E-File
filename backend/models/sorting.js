const db = require('../db'); 

// Fetch files with flexible sorting
async function getFiles({ userID = null, sortBy = 'name', sortOrder = 'ASC' } = {}) {
    // Validate sortBy and sortOrder inputs
    const validSortFields = ['name', 'size', 'upload_date']; // fields to sort db
    if (!validSortFields.includes(sortBy)) {
        sortBy = 'name'; // Default 
    }
    if (sortOrder !== 'ASC' && sortOrder !== 'DESC') {
        sortOrder = 'ASC'; // Default sort
    }

    // querry db (saya lupa struktur db file nya le)
    let query = `
        SELECT id, name, size, upload_date 
        FROM files
    `;
    const params = [];

    // user filtering db
    if (userID) {
        query += ` WHERE user_id = ?`;
        params.push(userID);
    }

    // sorting logic (for now based on user input)
    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    const [rows] = await db.execute(query, params);
    return rows; // sorted rows
}

module.exports = { getFiles };
