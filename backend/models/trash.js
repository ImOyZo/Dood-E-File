const pool = require('../db');

// Move a file to the trash
async function moveToTrash(userID, filename) {
    const query = `
        UPDATE files
        SET trashed = 1, trashed_at = NOW()
        WHERE user_id = ? AND filename = ? AND trashed = 0;
    `;

    const [result] = await pool.execute(query, [userID, filename]);

    if (result.affectedRows === 0) {
        throw new Error('File not found or already trashed');
    }

    return { message: 'File moved to trash' };
}

// Retrieve files from the trash
async function getTrashFiles(userID) {
    const query = `
        SELECT id, filename, trashed_at
        FROM files
        WHERE user_id = ? AND trashed = 1;
    `;

    const [rows] = await pool.execute(query, [userID]);
    return rows;
}

// Restore a file from the trash
async function restoreFromTrash(userID, filename) {
    const query = `
        UPDATE files
        SET trashed = 0, trashed_at = NULL
        WHERE user_id = ? AND filename = ? AND trashed = 1;
    `;

    const [result] = await pool.execute(query, [userID, filename]);

    if (result.affectedRows === 0) {
        throw new Error('File not found in trash');
    }

    return { message: 'File restored' };
}

// Permanently delete a file from the trash
async function deleteFromTrash(userID, filename) {
    const query = `
        DELETE FROM files
        WHERE user_id = ? AND filename = ? AND trashed = 1;
    `;

    const [result] = await pool.execute(query, [userID, filename]);

    if (result.affectedRows === 0) {
        throw new Error('File not found in trash');
    }

    return { message: 'File permanently deleted' };
}

module.exports = {
    moveToTrash,
    getTrashFiles,
    restoreFromTrash,
    deleteFromTrash,
};
