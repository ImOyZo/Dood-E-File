const express = require('express');
const bodyParser = require('body-parser');
const { handleAddUser, handleDeleteUser, handleEditUser, 
        handleFetchUserData, 
        handleFetchUser } = require('./handler/manageUser')
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
// Middleware
//app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOption));


// Routes to request Login verification
app.post('/login', async (req, res) => {
    await handleLogin(req, res);
});

// Routes to request File List
app.get('/files', async (req, res) => {
    const userdbID = req.headers['user-id'];
    if (!userdbID) {
        return res.status(401).json({ message: 'User not authenticated' });
    }   
    await handleFileList(req, res, userdbID);
});

// Route to Request File Download
app.get('/download/:filename', async (req, res) => {
    const filename = req.params.filename;
    const loginID = req.headers['user-id'];
    if (!loginID) {
        return res.status(401).json({ message: 'User not authenticated' });
    } 
    await handleFileDownload(req, res, filename, loginID);
});

// Route to Request File Upload
app.post('/upload', upload.single('file'), async (req, res) => {
    const loginID = req.headers['user-id'];  
    if (!loginID) {
        return res.status(401).json({ message: 'User not authenticated' });
    } 
    await handleFileUpload (req, res, loginID);
});

// Route to Request Starred file
app.get('/starred', async (req, res) => {
    const loginID = req.headers['user-id'];
    if (!loginID) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    await handleStarredFile(req, res, loginID);
})

//Route to Request File Rename
app.post('/renamefile', async (req, res) => {
    const loginID = req.headers['user-id'];
    if (!loginID) {
        return res.status(401).json({ message: 'User not authenticated'});
    }
    await handleRenameFile (req, res, loginID);
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

// Fetch user to admin panel
app.get('/user/list', async (req, res) => {
    handleFetchUser(req, res);
})

// send route to request user data to be edited
app.get('/user/:userID', async (req, res) =>{
    const userID = req.params.userID;
    handleFetchUserData (req, res, userID);
})

// Send data from addUser()
app.post('/user/add', async (req, res) => {
    console.log("Received body:", req.body);
    const { username, fullName, email, password, role } = req.body;
    handleAddUser(req, res, username, fullName, email, password, role);
})

// Send data of edited user 
app.put('/user/edit/:userID', async (req, res) => {
    const userID = req.params.userID;
    const { username, fullName, email, password, role } = req.body;
    handleEditUser(req, res, userID, username, fullName, email, password, role);
})

// Send request for log notification
app.get('/user/logs', async (req, res) => {
    const userID = req.query.userID;

    if (!userID) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const logs = await fetchLogs(userID); 
        res.status(200).json(logs); 
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
