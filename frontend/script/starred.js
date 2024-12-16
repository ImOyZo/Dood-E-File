// Still not working


// Cookie 
function getCookie(name){
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function deleteFile(filename) {
    const userID = getCookie('userID');

    if (!userID) {
        // Redirect to login if no userID found
        window.location.href = '/frontend2/pages/login.html';
        return;
    }

    try {
        const response = await fetch(`/delete/${filename}`, {
            method: 'DELETE',
            headers: {
                'user-id': userID
            },
            credentials: 'include'
        });

        if (response.ok) {
            alert(`File "${filename}" has been deleted successfully.`);
            // Optionally refresh the file list
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

    const userID = getCookie('userID');

    if (!userID) {
        //alert('You must log in first!');
        window.location.href = '/frontend2/pages/login.html'; // Redirect to login if no userID found
        return;
    }


    try {
        // Fetch /upload  
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
            headers: {
                'user-id': userID
            },
            credentials: 'include'
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
    const userID = getCookie('userID');

    if (!userID) {
        //alert('You must log in first!');
        window.location.href = '/frontend2/pages/login.html'; // Redirect to login if no userID found
        return;
    }

    try {
        const response = await fetch(`/download/${filename}`, {
            method: 'GET',
            headers: {
                'user-id': userID
            },
            credentials: 'include'
        });

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

async function openRenameModal(filePath) {
    document.getElementById('oldFilePath').value = filePath;
    document.getElementById('newFileName').value = '';
    
    const renameModal = new bootstrap.Modal(document.getElementById('renameModal'));
    renameModal.show();
}
// Broken
async function renameFile() {
    const userID = getCookie('userID')
    const newName = document.getElementById('newFileName').value;
    const oldFilePath = document.getElementById('oldFilePath').value;

    if (newName && oldFilePath) {
        try {
            const response = await fetch('/renamefile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': userID,
                }, 
                credentials: 'include',
                body: JSON.stringify({
                    path: oldFilePath,
                    newName: newName,
                    userID: userID
                    
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

// Function to fetch starred files
async function fetchStarredFiles() {
    const userID = getCookie('userID');

    if (!userID) {
        window.location.href = '/frontend2/pages/login.html'; // Redirect if no userID
        return;
    }

    const container = document.getElementById("fileContainer");
    const pathDisplay = document.getElementById("current-path");

    try {
        // API request to the backend /starred route
        const response = await fetch(`/api/starred`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'user-id': userID
            },
            credentials: 'include'
        });

        console.log('Starred Response:', response);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const files = await response.json();
        console.log('Starred Files:', files);

        // Clear previous content
        container.innerHTML = "";

        if (files.length === 0) {
            container.innerHTML = '<p>No starred files available.</p>';
            return;
        }

        // Update the path display for starred files
        pathDisplay.innerHTML = `<strong>Starred Files</strong>`;

        // Render the starred files
        files.forEach((file) => {
            container.innerHTML += `
                <div class="col-6 col-sm-4 col-md-3 file-card">
                    <div class="card">
                        <div class="card-body text-center position-relative">
                            <i data-feather="star" class="text-warning mb-3" style="width: 50px; height: 50px"></i>
                            <h6 class="card-title">${file.name}</h6>
                            <p class="text-muted small">Path: ${file.path}</p>

                            <div class="dropdown position-absolute bottom-0 end-0 p-2">
                                <button class="btn btn-link text-dark" type="button" id="dropdownMenuButton${file.name}" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i data-feather="more-vertical"></i>
                                </button>
                                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${file.name}">
                                    <li><a class="dropdown-item" onclick="downloadFile('${file.path}')">Download</a></li>
                                    <li><a class="dropdown-item text-danger" onclick="deleteFile('${file.path}')">Delete</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>`;
        });

        // Update feather icons
        feather.replace();
    } catch (error) {
        console.error('Error fetching starred files:', error);
        alert('Failed to fetch starred files. Please try again later.');
    }
}


// Event listener to fetch starred files (e.g., on button click)
fetchStarredFiles();


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

