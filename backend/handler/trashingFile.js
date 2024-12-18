const fs = require('fs');
const path = require('path');

// Base directory for user trash folders
const TRASH_DIR = path.join(__dirname, '../trash');

// Ensure the trash directory exists
if (!fs.existsSync(TRASH_DIR)) {
    fs.mkdirSync(TRASH_DIR);
}

// Move a file to the trash
async function moveToTrash(userID, filename) {
    const userTrashDir = path.join(TRASH_DIR, userID);
    if (!fs.existsSync(userTrashDir)) {
        fs.mkdirSync(userTrashDir);
    }
    const filePath = path.join(__dirname, '../hoome', filename); // ini file direktori user na
    const trashPath = path.join(userTrashDir, filename);

    if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
    }

    fs.renameSync(filePath, trashPath);
    return { message: 'File moved to trash' };
}

// Retrieve files from the trash
async function getTrashFiles(userID) {
    const userTrashDir = path.join(TRASH_DIR, userID);

    if (!fs.existsSync(userTrashDir)) {
        return [];
    }

    return fs.readdirSync(userTrashDir);
}

// Restore a file from the trash
async function restoreFromTrash(userID, filename) {
    const userTrashDir = path.join(TRASH_DIR, userID);
    const trashPath = path.join(userTrashDir, filename);
    const restorePath = path.join(__dirname, '../home', filename);

    if (!fs.existsSync(trashPath)) {
        throw new Error('File not found in trash');
    }

    fs.renameSync(trashPath, restorePath);
    return { message: 'File restored' };
}

// Permanently delete a file from the trash, idk should i make separate handler for this one, but, here ya go
async function deleteFromTrash(userID, filename) {
    const userTrashDir = path.join(TRASH_DIR, userID);
    const trashPath = path.join(userTrashDir, filename);

    if (!fs.existsSync(trashPath)) {
        throw new Error('File not found in trash');
    }

    fs.unlinkSync(trashPath);
    return { message: 'File permanently deleted' };
}

module.exports = {
    moveToTrash,
    getTrashFiles,
    restoreFromTrash,
    deleteFromTrash,
};
