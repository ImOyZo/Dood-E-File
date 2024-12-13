const express = require('express');
const bodyParser = require('body-parser');
const { upload, handleFileUpload } = require('./handler/uploadFile');
const { handleFileDownload } = require('./handler/downloadFile');
const { handleFileList } = require('./handler/listFile');
const cors = require('cors');

const app = express();

let corsOption = {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOption));
app.use(bodyParser.json());

// Use your db userID
const hardcodedId = 2;

app.get('/files', async (req, res) => {
    await handleFileList(req, res, hardcodedId);
});
app.get('/download/:filename', async (req, res) => {
    const filename = req.params.filename;
    await handleFileDownload(req, res, filename, hardcodedId);
});
app.post('/upload', upload.single('file'), async (req, res) => {
    await handleFileUpload (req, res, hardcodedId);
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
