const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const fs = require('fs');
const pathModule = require('path');
const { handleAddUser, 
        handleDeleteUser, 
        handleEditUser, 
        handleFetchUserData, 
        handleFetchUser 
    } = require('./handler/manageUser');
const { handleMakeDirectory } = require('./handler/makeFolder');
const { upload, handleFileUpload } = require('./handler/uploadFile');
const { handleFileDownload } = require('./handler/downloadFile');
const { handleFileList, handlePreview } = require('./handler/listFile');
const { handleLoginUser, handleLoginAdmin } = require('./handler/login');
const { handleRenameFile } = require('./handler/renameFile');
const { handleFileDelete, handleMoveTrash, HandleRecoverFromTrash, handleListTrash } = require('./handler/trashFile');
const { handleStarredFile, handleTrueStarred, handleFalseStarred } = require('./handler/starredFile');
const { fetchFolderContents, handleSharedDownload, handleSharedUpload, fetchFileDetails } = require('./handler/shareFile')
const { handleNotification } = require('./handler/notification');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);


io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

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
app.post('/login/user', async (req, res) => {
    await handleLoginUser(req, res);
});

app.post('/login/admin', async (req, res) => {
    await handleLoginAdmin(req, res);
})

// Routes to request File List
app.get('/file/list', async (req, res) => {
    const loginID = req.headers['user-id'];
    if (!loginID) {
        return res.status(401).json({ message: 'User not authenticated' });
    }   
    await handleFileList(req, res, loginID);
});

app.get('/file/preview', async (req, res) => {
    const loginID = req.headers['user-id'];
    const path = req.query.path || '/';
    const fileName = req.query.file;
    console.log('Received request for preview', loginID, path, fileName);
    if (!loginID) {
        return res.status(401).json({ message: 'User not authenticated' });
    }   
    await handlePreview(req, res, loginID);
});

app.post('/file/createfolder', async (req, res) => {
    const loginID = req.headers['user-id'];
    const folderName = req.body.folderName;
    console.log('Path Received:', req.query.path); // Debug: log the received path
    if (!loginID) {
        return res.status(401).json({ message: 'User not authenticated' });
    } 
    await handleMakeDirectory(req, res, folderName, loginID);
})

// Route to Request File Download
app.get('/file/download/:filename', async (req, res) => {
    const filename = req.params.filename;
    const path = req.query.path || '/';
    const loginID = req.headers['user-id'];
    console.log('Received request for download');
    console.log('Filename:', filename);
    console.log('Path:', path);
    console.log('User ID:', loginID);
    if (!loginID) {
        return res.status(401).json({ message: 'User not authenticated' });
    } 
    await handleFileDownload(req, res, filename,path, loginID);
});

app.get('/notification/list', async (req, res) => {
    console.log('Received request on /notification/list');
    const loginID = req.headers['user-id'];
    if (!loginID) {
        return res.status(401).json({ message: 'User not authenticated' });
    } 
    await handleNotification(req, res, loginID);
});

// Route to Request File Upload
app.post('/file/upload', upload.single('file'), async (req, res) => {
    const loginID = req.headers['user-id'];  
    if (!loginID) {
        return res.status(401).json({ message: 'User not authenticated' });
    } 
    await handleFileUpload (req, res, io, loginID);
});

// Route to Request Starred file
app.get('/file/starred/list', async (req, res) => {
    const loginID = req.headers['user-id'];
    if (!loginID) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    await handleStarredFile(req, res, loginID);
})

app.post('/file/starred/add/:filename', async (req, res) => {
    const loginID = req.headers['user-id'];
    const fileName = req.params.filename;
    if (!loginID) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    await handleTrueStarred(req, res, fileName, loginID);
});

app.post('/file/starred/remove/:filename', async (req, res) => {
    const loginID = req.headers['user-id'];
    const fileName = req.params.filename;
    if (!loginID) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    await handleFalseStarred(req, res, fileName, loginID);
});

//Route to Request File Rename
app.post('/file/renamefile', async (req, res) => {
    const { newName, oldFileName } = req.body;
    const path = req.query.path || '/';
    console.log('Base Path:', path); // Debug: log the received path
    console.log('Old Name:',oldFileName);
    console.log('New name:', newName); // Debug: log the new name
    const loginID = req.headers['user-id'];
    if (!loginID) {
        return res.status(401).json({ message: 'User not authenticated'});
    }
    await handleRenameFile (req, res, path, newName, oldFileName, loginID);
});

// List Trash Folder Based on userID
app.get('/file/trashlist', async (req, res) => {
    const loginID = req.headers['user-id'];
    if (!loginID) {
        return res.status(401).json({ message: 'User not authenticated' });
    }   
    await handleListTrash(req, res, loginID);
});

// Recover File from trash
app.post('/file/recover/:filename', async (req, res) => {
    const fileName = req.params.filename;
    const userID = req.headers['user-id'];
    if (!userID){
        return res.status(401).json({ message: 'User not authenticadet'});
    }
    await HandleRecoverFromTrash(req, res, fileName, userID);
})

// Move file to trash folder
app.post('/file/trash/:filename', async (req, res) => {
    const fileName = req.params.filename;
    const loginID = req.headers['user-id'];
    if (!loginID){
        return res.status(401).json({ message: 'User not authenticadet'});
    }
    await handleMoveTrash(req, res, fileName, loginID);
})

// Route to Request File Delete
app.delete('/file/delete/:filename', async (req, res) => {
    const filename = req.params.filename;
    const loginID = req.headers['user-id'];
    if (!loginID){
        return res.status(401).json({ message: 'User not authenticadet'});
    }
    await handleFileDelete(req, res, filename, loginID);
})

// Fetch user to admin panel
app.get('/user/list', async (req, res) => {
    const loginID = req.headers['user-id'];
    if (!loginID){
        return res.status(401).json({ message: 'User not authenticated'});
    }
    handleFetchUser(req, res, loginID);
})

// send route to request user data to be edited
app.get('/user/:userID', async (req, res) =>{
    const userID = req.params.userID;
    const loginID = req.headers['user-id'];
    if (!loginID){
        return res.status(401).json({ message: 'User not authenticated'});
    }
    handleFetchUserData (req, res, userID, loginID);
})

// Send data from addUser()
app.post('/user/add', async (req, res) => {
    console.log("Received body:", req.body);
    const loginID = req.headers['user-id'];
    if (!loginID){
        return res.status(401).json({ message: 'User not authenticated'});
    }
    const { username, fullName, email, password, role } = req.body;
    handleAddUser(req, res, username, fullName, email, password, role, loginID);
})

// Send data of edited user 
app.put('/user/edit/:userID', async (req, res) => {
    const userID = req.params.userID;
    const loginID = req.headers['user-id'];
    if (!loginID){
        return res.status(401).json({ message: 'User not authenticated'});
    }
    const { username, fullName, email, password, role } = req.body;
    handleEditUser(req, res, userID, username, fullName, email, password, role, loginID);
})

app.delete('/user/delete/:userID', async (req, res) => {
    const userID = req.params.userID;
    const loginID = req.headers['user-id'];
    if (!loginID){
        return res.status(401).json({ message: 'User not authenticated'});
    }
    handleDeleteUser(req, res, userID, loginID);
})

const fileDB = new Map();

app.post('/file/share', async (req, res) => {
    const { name, isDirectory, path } = req.body;
    const loginID = req.headers['user-id'];

    if (!loginID) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        const shareToken = uuidv4(); // Generate unique token
        const shareData = {
            name,
            isDirectory,
            path,
            loginID,
            token: shareToken,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // Expires in 7 days
        };

        fileDB.set(shareToken, shareData);

        // Change the link if needed
        const shareLink = `https://doodefile.randomflies.my.id/file/share/${shareToken}`;
        res.json({ shareLink });
    } catch (error) {
        console.error('Error sharing file/folder:', error);
        res.status(500).send('Failed to share.');
    }
});

app.get('/file/share/:token', async (req, res) => {
    const token = req.params.token;
    const shareData = fileDB.get(token);

    if (!shareData || Date.now() > shareData.expiresAt) {
        return res.status(404).send('Share link expired or invalid.');
    }

    const { name, isDirectory, path, loginID } = shareData;

    console.log('Share Data:', shareData);
    console.log('Path for shared content:', path + '/' + name);
    console.log('Is Directory:', isDirectory);

    try {
        if (!isDirectory) {
            // Handle the file sharing case
            const fileDetails = await fetchFileDetails(loginID, path);

            // Create the HTML to display file details
            const fileDetailsHtml = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <title>${fileDetails.name}</title>
                    <link
                        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                        rel="stylesheet"
                    />
                    <link rel="stylesheet" href="../styles/dashboard.css" />
                </head>
                <body>
                    <nav class="navbar navbar-expand-lg bg-body-tertiary">
                        <div class="container-fluid">
                            <a class="navbar-brand text-primary fw-bold" href="#">DOODE</a>
                        </div>
                    </nav>
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-md-9 col-lg-10 p-4">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h4 id="current-path">${fileDetails.name}</h4>
                                </div>
                                <div class="card">
                                    <div class="card-body">
                                        <p><strong>Size:</strong> ${fileDetails.size} MB</p>
                                        <p><strong>Type:</strong> ${fileDetails.type}</p>
                                        <p><strong>Last Modified:</strong> ${fileDetails.date}</p>
                                        <div class="dropdown">
                                            <button class="btn btn-primary" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                                                Download
                                            </button>
                                            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                                <li><a class="dropdown-item" href="/file/share/${token}?path=${encodeURIComponent(path)}&filename=${encodeURIComponent(name)}" download="${fileDetails.name}">Download</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
                    <script src="https://unpkg.com/feather-icons"></script>
                    <script>
                        feather.replace();
                    </script>
                </body>
                </html>
            `;

            res.send(fileDetailsHtml);

        } else {
            // Handle folder contents (unchanged)
            let folderContentsHtml = '';
            const folderContents = await fetchFolderContents(loginID, path + '/' + name);

            folderContentsHtml = folderContents
                .map((item) => {
                    const icon = item.type === 'file' ? 'file' : 'folder';
                    return `
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <div class="card">
                                <div class="card-body text-center">
                                    <i data-feather="${icon}" class="icon-size"></i>
                                    <p class="mt-2">${item.name}</p>
                                    <small class="text-muted">${item.size} MB - ${item.date}</small>
                                    <div class="dropdown position-absolute bottom-0 end-0 p-2">
                                        <button class="btn btn-link text-dark" type="button" onclick="event.stopPropagation()" id="dropdownMenuButton${item.name}" data-bs-toggle="dropdown" aria-expanded="false">
                                            <i data-feather="more-vertical"></i>
                                        </button>
                                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${item.name}" onclick="event.stopPropagation()">
                                            <li><a href="/file/share/${shareData.token}?path=${encodeURIComponent(path)}&filename=${encodeURIComponent(item.name)}" download="${item.name}">Download</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                })
                .join('');

            // Return the HTML with the folder contents
            const dynamicHtml = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <title>${name}</title>
                    <link
                        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                        rel="stylesheet"
                    />
                    <link rel="stylesheet" href="../styles/dashboard.css" />
                </head>
                <body>
                    <nav class="navbar navbar-expand-lg bg-body-tertiary">
                        <div class="container-fluid">
                            <a class="navbar-brand text-primary fw-bold" href="#">DOODE</a>
                        </div>
                    </nav>
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-md-9 col-lg-10 p-4">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h4 id="current-path">${name}</h4>
                                </div>
                                <div class="row g-3" id="fileContainer">
                                    ${folderContentsHtml}
                                </div>
                            </div>
                        </div>
                    </div>
                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
                    <script src="https://unpkg.com/feather-icons"></script>
                    <script>
                        feather.replace();
                    </script>
                </body>
                </html>
            `;
            res.send(dynamicHtml);
        }
    } catch (error) {
        console.error('Error fetching shared content:', error.message);
        res.status(500).send('Failed to fetch shared content.');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
