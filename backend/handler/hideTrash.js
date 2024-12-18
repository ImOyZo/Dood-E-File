const fs = require('fs');
const path = require('path');

async function handleFileList(req, res, userID) {
    const uploadDir = path.join(__dirname, '../uploads');
    const trashDir = path.join(__dirname, '../trash', userID);

    if (!fs.existsSync(uploadDir)) {
        return res.status(200).json({ files: [] });
    }

    const files = fs.readdirSync(uploadDir);

    // Exclude files in the trash
    let trashFiles = [];
    if (fs.existsSync(trashDir)) {
        trashFiles = fs.readdirSync(trashDir);
    }

    const visibleFiles = files.filter(file => !trashFiles.includes(file));
    res.status(200).json({ files: visibleFiles });
}
