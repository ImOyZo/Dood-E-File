const express = require('express');
const {upload, handleFileUpload} = require('./uploadfile');
const {handleFileDownload} = require('./downloadfile');
const {handleFileList} = require('./listfile');
const cors = require('cors');

const app = express();

let corsOption = {
    origin : '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
  
app.use(cors(corsOption));
  
app.post('/upload', upload.single('file'), handleFileUpload);

app.get('/files', cors(corsOption),handleFileList);

app.get('/download/:filename', async (req, res) => {
    const filename = req.params.filename;
    await handleFileDownload (req, res, filename);
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});