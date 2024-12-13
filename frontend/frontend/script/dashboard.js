// Used to communicate betwen client-side (web browser) and Server-side (backend and server)

// Function to upload file to backend
async function uploadFile() {
    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file first!');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        // Fetch /upload  
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('File uploaded successfully!');
            // Refresh the file list after successful upload
            if (typeof fetchFiles === 'function') {
                fetchFiles();
            }
        } else {
            alert('Upload failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Upload error');
    }
}

// Download File Function
async function downloadFile(filename) {
    try {
        const response = await fetch(`/download/${filename}`);

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Create an anchor element to trigger the download
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;  
            document.body.appendChild(a);  
            a.click();  
            document.body.removeChild(a);  

            // Clean up the object URL
            window.URL.revokeObjectURL(url);
        } else {
            alert('Download failed');
        }
    } catch (error) {
        console.error('Download error:', error);
        alert('Download failed');
    }
}

async function openRenameModal(filename) {
    document.getElementById('newFileName').value = filename;
    
    const renameModal = new bootstrap.Modal(document.getElementById('renameModal'));
    renameModal.show();
}
// Broken
async function renameFile() {
    const newName = document.getElementById('newFileName').value;
    const oldFilePath = document.getElementById('oldFilePath').value;

    if (newName && oldFilePath) {
        try {
            const response = await fetch('/renamefile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    newName: newName,
                    oldFilePath: oldFilePath
                })
            });

            const result = await response.json();
            if (response.ok) {
                alert('File Rename Success');
                const renameModal = bootstrap.Modal.getInstance(document.getElementById('renameModal'));
                renameModal.hide();
            } else {
                alert(result.message || 'Error Renaming File');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        alert('Enter Valid New Name');
    }
}

function getCookie(name){
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Set Fetching File Dir
 // Start at the root directory
let currentPath = '/'; 
async function fetchFiles(){

    const userID = getCookie('userID');

    if (!userID) {
        //alert('You must log in first!');
        window.location.href = '/frontend2/pages/login.html'; // Redirect to login if no userID found
        return;
    }

    const container = document.getElementById("fileContainer");
    const pathDisplay = document.getElementById("current-path");

    try {
        // Fetch /files from the Backend
        const response = await fetch(`/files?userID=${userID}&path=${encodeURIComponent(currentPath)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'user-id': userID
            },
            credentials: 'include'
        });

        console.log('Response:', response);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const files = await response.json(); 

        // Clear existing files in the container
        container.innerHTML = "";

        if (files.length === 0) {
            container.innerHTML = '<p>No files uploaded yet.</p>';
            return;
        }

        const pathParts = currentPath.split('/').filter(Boolean);
        let pathHtml = '<a href="#" onclick="navigateToFolder(\'/\')">My Drive</a>';
        let tempPath = '/';

        pathParts.forEach((part, index) => {
            tempPath += `${part}`;
            pathHtml += `> <a href="#" onclick="navigateToFolder('${tempPath}')">${part}</a>`;
        });

        // Update the path display
        pathDisplay.innerHTML = pathHtml;

        // Populate the container with file cards
        files.forEach((file) => {
            const isDirectory = file.type === 'directory'; // Check if the file is a directory
            container.innerHTML += `
                <div class="col-6 col-sm-4 col-md-3 file-card" onclick="handleFileClick('${file.name}', ${isDirectory})">
                    <div class="card">
                        <div class="card-body text-center">
                            <i data-feather="${isDirectory ? 'folder' : 'file'}" class="text-primary mb-3w4z" style="width: 50px; height: 50px"></i>
                            <h6 class="card-title">${file.name}</h6>
                            <p class="text-muted small">${file.size ? file.size + ' KB' : ''}</p>

                            <div class="dropdown">
                                <button class="btn btn-link text-dark" type="button" id="dropdownMenuButton${file.name}" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i data-feather="more-vertical"></i>
                                </button>
                                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${file.name}">
                                    <li><a class="dropdown-item" onclick="downloadFile('${file.name}')">Download</a></li>
                                    <li><a class="dropdown-item" onclick="openRenameModal('${file.name}')">Rename</a></li>
                                    <li><a class="dropdown-item" onclick="share('${file.name}')">Share</a></li>
                                    <li><a class="dropdown-item text-danger" onclick="deleteFile('${file.name}')">Delete</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>`
        });

        // Replace feather icons
        feather.replace();
    } catch (error) {
        console.error('Error fetching files:', error);
        alert('Failed to fetch files. Please try again later.');
    }
}

// Function to handle file/folder click
function handleFileClick(name, isDirectory) {
    if (isDirectory) {
        // If we're at the root or the path already ends with a slash, just append the folder name
        if (currentPath === '/' || currentPath.endsWith('/')) {
            currentPath = `${currentPath}${name}`;
        } else {
            // Prevent appending the directory twice
            if (!currentPath.endsWith(name)) {
                currentPath = `${currentPath}/${name}`;
            }
        }

        console.log('Updated path:', currentPath);  // For debugging
        fetchFiles(); // Fetch the files in the new directory
    }
}

function navigateToFolder(path){
    currentPath = path;
    fetchFiles();
}

// Initial call to fetch files on page load
fetchFiles();