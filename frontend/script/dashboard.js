// Cookie (Authentication)
function getCookie(name){
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function showNotifications() {
    const loginID = getCookie('loginID');
    const notificationsList = document.getElementById('notificationsList');

    if (!loginID) {
        window.location.href = '/frontend/pages/login.html';
        return;
    }

    try {
        const response = await fetch(`/notification/list`, {
            method: 'GET',
            headers: {
                'user-id': loginID
            },
            credentials: 'include'
            });
        if (!response.ok) {
            throw new Error('Failed to fetch notifications');
        }
        const notifications = await response.json();
        notificationsList.innerHTML = ''; // Clear previous notifications

        // Populate notifications
        notifications.forEach((logs) => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.innerHTML = `
                <span>${logs.action}</span>
                <small class="text-muted">${logs.date}</small>
        `;
        notificationsList.appendChild(listItem);
        });
    
    } catch (error) {
        console.error('Error fetching notifications:', error);
        alert('Failed to fetch notifications.');
    }
    // Show the modal
    const notificationsModal = new bootstrap.Modal(document.getElementById('notificationsModal'));
    notificationsModal.show();
}

// Add event listener to the bell icon
document.getElementById('bell').addEventListener('click', (event) => {
    event.preventDefault();
    showNotifications();
});

document.getElementById('user').addEventListener('click', () => {
    const loginID = getCookie('loginID');
    window.location.href = `/frontend/pages/userprofile.html?userID=${loginID}`;
});

// Delete file from user workspace (added trash soon)
async function moveToTrash(filename) {
    currentPath = currentPath;
    const loginID = getCookie('loginID');

    if (!loginID) {
        window.location.href = '/frontend/pages/login.html';
        return;
    }
    try {
        const response = await fetch(`/file/trash/${filename}?path=${encodeURIComponent(currentPath)}`, {
            method: 'POST',
            headers: {
                'user-id': loginID
            },
            credentials: 'include'
        });
        if (response.ok) {
            alert(`File "${filename}" has been moved to trash successfully.`);
            // Refresh file list after deletion
            fetchFiles();
        } else {
            const errorMsg = await response.text();
            alert(`Failed to delete file: ${errorMsg}`);
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('An error occurred while deleting the file.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-upload');

    // Prevent default behavior for drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
        uploadZone.addEventListener(event, (e) => {
            e.preventDefault(); // Prevent default behavior
            e.stopPropagation(); // Stop propagation
        });
    });

    // Highlight the drop zone when dragging over
    uploadZone.addEventListener('dragenter', () => {
        console.log('File is being dragged over the upload zone.');
        uploadZone.setAttribute('data-dragging', 'true');
    });

    uploadZone.addEventListener('dragover', () => {
        uploadZone.setAttribute('data-dragging', 'true');
    });

    // Remove highlight when dragging leaves
    uploadZone.addEventListener('dragleave', () => {
        console.log('Left file upload zone');
        uploadZone.setAttribute('data-dragging', 'false');
    });

    // Handle file drop
    uploadZone.addEventListener('drop', (e) => {
        uploadZone.setAttribute('data-dragging', 'false');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFiles(files); // Pass the dropped files directly
        }
    });

    // Handle file selection via browse
    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            handleFiles(files); // Handle selected files
        }
    });

    function handleFiles(files) {
        if (files && files.length > 0) {
            uploadFile(files[0])}
    }
});

async function createFolder(){
    currentPath = currentPath;
    var folderName = document.getElementById('folderName').value;
    console.log(currentPath)
    console.log('Folder Path:', currentPath);
    if(!folderName){
        alert('Please input folder name');
    }
    const loginID = getCookie('loginID')
    try {
        const response = await fetch(`/file/createfolder?path=${encodeURIComponent(currentPath)}`, {
            method: 'POST',
            headers: {
                'user-id': loginID,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({folderName: folderName}),
            credentials: 'include'
        })
        if (response.ok) {
            alert('Folder Created successfully!');
            const createFolderModal = bootstrap.Modal.getInstance(document.getElementById('createFolderModal'));
            createFolderModal.hide();
            document.getElementById('folderName').value = '';
            // Refresh list in dashboard after success creation
            if (typeof fetchFiles === 'function') {
                fetchFiles();
            }
        } else {
            alert('Upload failed');
        }
    } catch(err){
        console.log('Creating folder Error', err)
        alert('Failed Creating Folder', err)
    }
}

// Upload file to user dashboard
    async function uploadFile(file) {

        if (!file) {
            alert('Please select a file first!');
            return;
        }
        const folderPath = document.getElementById('uploadPath').value;
        // Append the uploaded file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folderPath', currentPath);

        const loginID = getCookie('loginID');
        if (!loginID) {
            window.location.href = '/frontend/pages/login.html'; 
            return;
        }
        try {
            xhr = new XMLHttpRequest()
            // Send teh appended file to /upload routes
            xhr.open('POST',`/file/upload?path=${encodeURIComponent(folderPath)}`, true);
            xhr.setRequestHeader('user-id', loginID);
            xhr.withCredentials = true;

            xhr.upload.onprogress = function(event){
                if(event.lengthComputable){
                    const percent  = (event.loaded / event.total) * 100;
                    document.getElementById('uploadProgress').style.width = percent + '%';
                    document.getElementById('uploadProgress').textContent = Math.round(percent) + '%';
                }
            };
            
            xhr.onload = function() {
                if(xhr.status === 200){
                    alert('File uploaded successfully!');
                    const uploadModal = new bootstrap.Modal(document.getElementById('uploadModal'));
                    uploadModal.hide();
                    document.getElementById('uploadProgress').style.width = '0%'
                    document.getElementById('uploadProgress').textContent = '0%'
                    // Optionally refresh the list after successful upload
                    if (typeof fetchFiles === 'function') {
                        fetchFiles();
                    } 
                } else {
                    alert('upload failed')
                }
            };

            xhr.onerror = function() {
                console.error('Error during upload');
                alert('Upload error');
            };

            xhr.send(formData);
        } catch (error) {
            console.error('Error:', error);
            alert('Upload error');
        }
}

// Download File Function
async function downloadFile(filename) {
    const loginID = getCookie('loginID');

    if (!loginID) {
        //alert('You must log in first!');
        window.location.href = '/frontend/pages/login.html'; // Redirect to login if no userID found
        return;
    }

    try {
        const response = await fetch(`/file/download/${filename}?path=${encodeURIComponent(currentPath)}`, {
            method: 'GET',
            headers: {
                'user-id': loginID
            },
            credentials: 'include'
        });
        console.log('Backend Response Status:', response.status);

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

// Open modal for renaming file
async function openRenameModal(filename) {
    document.getElementById('oldFileName').value = filename;
    const renameModal = new bootstrap.Modal(document.getElementById('renameModal'));
    renameModal.show();
}

// Renaming File/Folder function 
async function renameFile() {
    const loginID = getCookie('loginID')
    const newName = document.getElementById('newFileName').value;
    const oldFileName = document.getElementById('oldFileName').value;

    if (newName && oldFileName) {
        try {
            const response = await fetch(`/file/renamefile?path=${encodeURIComponent(currentPath)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': loginID,
                }, 
                credentials: 'include',
                body: JSON.stringify({
                    newName: newName,
                    oldFileName: oldFileName,
                    
                })
            });

            const result = await response.json();
            if (response.ok) {
                alert('File Rename Success');
                fetchFiles();
                document.getElementById('newFileName').value = '';
            } else {
                alert(result.message || 'Error Renaming File');
            }
            
            const renameModal = bootstrap.Modal.getInstance(document.getElementById('renameModal'));
            renameModal.hide();
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        alert('Enter Valid New Name');
    }
}


function sortAndSearchFiles(sortKey) {
    const searchQuery = document.getElementById('searchInput').value;
    fetchFiles(searchQuery, sortKey);
}


// Set Fetching File Dir
// Start at the root directory
let currentPath = '/'; 
function setUploadPath(){
    document.getElementById('uploadPath').value = currentPath;
}

// Function for fetching file in dashboard
async function fetchFiles(searchQuery = '', sortKey = null){
    const loginID = getCookie('loginID');
    if (!loginID) {
        //alert('You must log in first!');
        window.location.href = '/frontend/pages/login.html'; // Redirect to login if no userID found
        return;
    }

    const container = document.getElementById("fileContainer");
    const pathDisplay = document.getElementById("current-path");

    try {
        // Fetch /files from the Backend
        const response = await fetch(`/file/list?loginID=${loginID}&path=${encodeURIComponent(currentPath)}&search=${encodeURIComponent(searchQuery)}&sort=${encodeURIComponent(sortKey)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'user-id': loginID
            },
            credentials: 'include'
        });

        console.log('Response:', response);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const files = await response.json(); 

        // Clear existing files in the container
        container.innerHTML = '';

        if (files.length === 0) {
            container.innerHTML = `
            <div class="text-center mt-5">
                <p>No files uploaded yet.</p>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#actionModal">Upload or Create Folder</button>
            </div>`;
            return;
        }

        if (sortKey) {
            files.sort((a, b) => {
                if (sortKey === 'name') {
                    return a.name.localeCompare(b.name); // Sort by name
                }
                if (sortKey === 'size') {
                    return a.size - b.size; // Sort by size
                }
                if (sortKey === 'date') {
                    return new Date(a.date) - new Date(b.date); // Sort by date (assuming `date` exists in the file object)
                }
                return 0;
            });
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
                        <div class="card-body text-center position-relative">
                            <i data-feather="${isDirectory ? 'folder' : 'file'}" class="text-primary mb-3w4z" style="width: 50px; height: 50px"></i>
                            <h6 class="card-title">${file.name}</h6>
                            <p class="text-muted small">${file.date || 'N/A'}</p>
                            <p class="text-muted small">${file.size ? file.size + ' MB' : ''}</p>

                            <div class="dropdown position-absolute bottom-0 end-0 p-2">
                                <button class="btn btn-link text-dark" type="button" onclick="event.stopPropagation()" id="dropdownMenuButton${file.name}" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i data-feather="more-vertical"></i>
                                </button>
                                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${file.name}" onclick="event.stopPropagation()">
                                    <li><a class="dropdown-item" onclick="previewFileOrFolder('${file.name}', ${isDirectory})">Preview</a></li>
                                    <li><a class="dropdown-item" onclick="downloadFile('${file.name}', '${file.path}')">Download</a></li>
                                    <li><a class="dropdown-item" onclick="starredFile('${file.name}')">Starred</a></li>
                                    <li><a class="dropdown-item" onclick="openRenameModal('${file.name}')">Rename</a></li>
                                    ${isDirectory ?`<li><a class="dropdown-item" onclick="share('${file.name}','${isDirectory}')">Share</a></li>` : ''}
                                    <li><a class="dropdown-item text-danger" onclick="moveToTrash('${file.name}')">Delete</a></li>
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

async function starredFile(filename) {
    const loginID = getCookie('loginID');

    if (!loginID) {
        //alert('You must log in first!');
        window.location.href = '/frontend/pages/login.html'; // Redirect to login if no userID found
        return;
    }

    try {
        const response = await fetch(`/file/starred/add/${filename}`, {
            method: 'POST',
            headers: {
                'user-id': loginID
            },
            credentials: 'include'
        });


        if (response.ok) {
            alert('File has been starred successfully.');
        } else {
            alert('Failed to starring file.');
        }
    } catch (error) {
        console.error('Starred error:', error);
        alert('An error occurred while starring file.');
    }
}

async function previewFileOrFolder(fileName, isDirectory) {
    const loginID = getCookie('loginID');
    if (!loginID) {
        window.location.href = '/frontend/pages/login.html'; // Redirect if not logged in
        return;
    }

    try {
        console.log('loginID:', loginID, 'currentPath:', currentPath, 'fileName:', fileName);

        // Fetch metadata from the backend
        const response = await fetch(`/file/preview?loginID=${loginID}&path=${encodeURIComponent(currentPath)}&file=${encodeURIComponent(fileName)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'user-id': loginID
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('Content-Type');
        
        let metadata = null;

        // If the response is a binary file (image/pdf)
        if (contentType.startsWith('image/') || contentType === 'application/pdf') {
            const blob = await response.blob();
            metadata = { 
                name: fileName,
                type: contentType,
                size: (blob.size / (1024 * 1024)).toFixed(2), // Size in MB
                modifyTime: 'N/A' // Modify time can be added if available
            };
            const previewContent = document.getElementById("previewContent");

            // Handle image preview
            if (contentType.startsWith('image/')) {
                previewContent.innerHTML = `
                    <h5>${fileName}</h5>
                    <ul class="list-group">
                        <li class="list-group-item"><strong>Type:</strong> ${isDirectory ? 'Folder' : 'File'}</li>
                        <li class="list-group-item"><strong>Size:</strong> ${metadata.size || 'N/A'} MB</li>
                        <li class="list-group-item"><strong>Last Modified:</strong> ${metadata.modifyTime || 'N/A'}</li>
                    </ul>
                    <div class="mt-3">
                        <strong>Preview:</strong>
                        <div class="border p-3">
                            <img src="${URL.createObjectURL(blob)}" alt="${fileName}" class="img-fluid" />
                        </div>
                    </div>
                `;
            }
            // Handle PDF preview
            else if (contentType === 'application/pdf') {
                previewContent.innerHTML = `
                    <h5>${fileName}</h5>
                    <ul class="list-group">
                        <li class="list-group-item"><strong>Type:</strong> ${isDirectory ? 'Folder' : 'File'}</li>
                        <li class="list-group-item"><strong>Size:</strong> ${metadata.size || 'N/A'} MB</li>
                        <li class="list-group-item"><strong>Last Modified:</strong> ${metadata.modifyTime || 'N/A'}</li>
                    </ul>
                    <div class="mt-3">
                        <strong>Preview:</strong>
                        <div class="border p-3">
                            <iframe class="w-100" style="height: 400px;" src="${URL.createObjectURL(blob)}"></iframe>
                        </div>
                    </div>
                `;
            }
        }
        else {
            // For non-binary files (e.g., text files), metadata is returned as JSON
            metadata = await response.json();

            const previewContent = document.getElementById("previewContent");
            previewContent.innerHTML = `
                <h5>${fileName}</h5>
                <ul class="list-group">
                    <li class="list-group-item"><strong>Type:</strong> ${isDirectory ? 'Folder' : 'File'}</li>
                    <li class="list-group-item"><strong>Size:</strong> ${metadata.size || 'N/A'} MB</li>
                    <li class="list-group-item"><strong>Last Modified:</strong> ${metadata.modifyTime || 'N/A'}</li>
                </ul>
                ${!isDirectory ? `
                    <div class="mt-3">
                        <strong>Preview:</strong>
                        <div class="border p-3">
                            <pre>${metadata.preview}</pre>
                        </div>
                    </div>
                ` : ''}
            `;
        }

        // Show the modal
        const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
        previewModal.show();

    } catch (error) {
        console.error('Error fetching metadata:', error);
        alert('Failed to fetch file metadata. Please try again later.');
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

// Function to help navigate inside folder
function navigateToFolder(path){
    currentPath = path;
    fetchFiles();
}

async function share(name, isDirectory) {
    const loginID = getCookie('loginID');
    if (!loginID) {
        window.location.href = '/frontend/pages/login.html'; 
        return;
    }

    try {
        const response = await fetch('/file/share', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': loginID
            },
            body: JSON.stringify({ name, isDirectory, path: currentPath }),
            credentials: 'include'
        });

        if (response.ok) {
            const result = await response.json();
            const shareLink = result.shareLink;
            window.open(shareLink, '_blank');
        } else {
            alert('Failed to create share link.');
        }
    } catch (error) {
        console.error('Share error:', error);
        alert('An error occurred while sharing.');
    }
}


// Call fetchFile() on load
fetchFiles();
