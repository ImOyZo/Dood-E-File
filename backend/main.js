
const express = require('express');
const bodyParser = require('body-parser');
const { upload, handleFileUpload } = require('./handler/uploadFile');
const { handleFileDownload } = require('./handler/downloadFile');
const { handleFileList } = require('./handler/listFile');
const { handleLogin } = require('./handler/login');
const { handleRenameFile } = require('./handler/renameFile');
const { handleFileDelete } = require('./handler/deleteFile');
const { handleStarredFile } = require('./handler/starredFile');
const cors = require('cors');

const app = express();

let corsOption = {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    Credential: true,
};

app.use(cors(corsOption));
app.use(bodyParser.json());

// Routes to request Login verification
app.post('/login', async (req, res) => {
    await handleLogin(req, res);
});

// Routes to request File List
app.get('/files', async (req, res) => {
    const userID = req.headers['user-id'];
    if (!userID) {
        return res.status(401).json({ message: 'User not authenticated' });
    }   
    await handleFileList(req, res, userID);
});

// Route to Request File Download
app.get('/download/:filename', async (req, res) => {
    const filename = req.params.filename;
    const userID = req.headers['user-id'];
    if (!userID) {
        return res.status(401).json({ message: 'User not authenticated' });
    } 
    await handleFileDownload(req, res, filename, userID);
});

// Route to Request File Upload
app.post('/upload', upload.single('file'), async (req, res) => {
    const userID = req.headers['user-id'];  
    if (!userID) {
        return res.status(401).json({ message: 'User not authenticated' });
    } 
    await handleFileUpload (req, res, userID);
});

// Route to Request Starred file
app.get('/starred', async (req, res) => {
    const userID = req.headers['user-id'];
    if (!userID) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    await handleStarredFile(req, res, userID);
})

//Route to Request File Rename
app.post('/renamefile', async (req, res) => {
    const userID = req.headers['user-id'];
    if (!userID) {
        return res.status(401).json({ message: 'User not authenticated'});
    }
    await handleRenameFile (req, res, userID);
});

// Route to Request File Delete
app.delete('/delete/:filename', async (req, res) => {
    const filename = req.params.filename;
    const userID = req.headers['user-id'];
    if (!userID){
        return rest.status(401).json({ message: 'User not authenticadet'});
    }
    await handleFileDelete(req, res, filename, userID);
})

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
