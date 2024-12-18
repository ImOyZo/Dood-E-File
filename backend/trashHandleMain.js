const {
    moveToTrash,
    getTrashFiles,
    restoreFromTrash,
    deleteFromTrash,
} = require('./handler/trashFile');

// Route to move a file to trash
app.post('/trash/:filename', async (req, res) => {
    const filename = req.params.filename;
    const userID = req.headers['user-id'];

    if (!userID) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        const response = await moveToTrash(userID, filename);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error moving file to trash:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to fetch files in trash
app.get('/trash', async (req, res) => {
    const userID = req.headers['user-id'];

    if (!userID) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        const files = await getTrashFiles(userID);
        res.status(200).json({ files });
    } catch (error) {
        console.error('Error fetching trash files:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to restore a file from trash
app.post('/trash/restore/:filename', async (req, res) => {
    const filename = req.params.filename;
    const userID = req.headers['user-id'];

    if (!userID) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        const response = await restoreFromTrash(userID, filename);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error restoring file from trash:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to permanently delete a file from trash
app.delete('/trash/:filename', async (req, res) => {
    const filename = req.params.filename;
    const userID = req.headers['user-id'];

    if (!userID) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        const response = await deleteFromTrash(userID, filename);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error deleting file from trash:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
