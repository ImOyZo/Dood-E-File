const { fetchUserFromEmail } = require('./models/users');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const { upload, handleFileUpload } = require('./handler/uploadFile');
const { handleFileDownload } = require('./handler/downloadFile');
const { handleFileList } = require('./handler/listFile');
const { handleLogin } = require('./handler/login');
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


app.post('/login', async (req, res) => {
    await handleLogin(req, res);
});


app.get('/files', async (req, res) => {
    const userID = req.headers['user-id'];
    if (!userID) {
        return res.status(401).json({ message: 'User not authenticated' });
    }   
    await handleFileList(req, res, userID);
});

app.get('/download/:filename', async (req, res) => {
    const filename = req.params.filename;
    const userID = req.headers['user-id'];
    if (!userID) {
        return res.status(401).json({ message: 'User not authenticated' });
    } 
    await handleFileDownload(req, res, filename, userID);
});

app.post('/upload', upload.single('file'), async (req, res) => {
    const userID = req.headers['user-id'];  
    if (!userID) {
        return res.status(401).json({ message: 'User not authenticated' });
    } 
    await handleFileUpload (req, res, userID);
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
