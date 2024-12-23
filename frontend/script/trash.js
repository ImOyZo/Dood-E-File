function getCookie(name){
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function recoverFile(filename) {
    const loginID = getCookie('loginID');

    if (!loginID) {
        window.location.href = '/frontend/pages/login.html';
        return;
    }
    try {
        const response = await fetch(`/file/recover/${filename}`, {
            method: 'POST',
            headers: {
                'user-id': loginID
            },
            credentials: 'include'
        });
        if (response.ok) {
            alert(`File "${filename}" has been recovered successfully.`);
            // Refresh file list after deletion
            fetchFilesTrash();
        } else {
            const errorMsg = await response.text();
            alert(`Failed to delete file: ${errorMsg}`);
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('An error occurred while deleting the file.');
    }
}

async function deleteFile(filename) {
    const loginID = getCookie('loginID');

    if (!loginID) {
        window.location.href = '/frontend/pages/login.html';
        return;
    }
    try {
        const response = await fetch(`/file/delete/${filename}`, {
            method: 'DELETE',
            headers: {
                'user-id': loginID
            },
            credentials: 'include'
        });
        if (response.ok) {
            alert(`File "${filename}" has been moved tp trash successfully.`);
            // Refresh file list after deletion
            fetchFilesTrash();
        } else {
            const errorMsg = await response.text();
            alert(`Failed to delete file: ${errorMsg}`);
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('An error occurred while deleting the file.');
    }
}

let currentPath = '/'; 
async function fetchFilesTrash(){

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
        const response = await fetch(`/file/trashlist?loginID=${loginID}&path=${encodeURIComponent(currentPath)}`, {
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
                        <div class="card-body text-center position-relative">
                            <i data-feather="${isDirectory ? 'folder' : 'file'}" class="text-primary mb-3w4z" style="width: 50px; height: 50px"></i>
                            <h6 class="card-title">${file.name}</h6>
                            <p class="text-muted small">${file.size ? file.size + ' MB' : ''}</p>

                            <div class="dropdown position-absolute bottom-0 end-0 p-2">
                                <button class="btn btn-link text-dark" type="button" onclick="event.stopPropagation()" id="dropdownMenuButton${file.name}" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i data-feather="more-vertical"></i>
                                </button>
                                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${file.name}" onclick="event.stopPropagation()">
                                    <li><a class="dropdown-item" onclick="recoverFile('${file.name}')">Recover</a></li>
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
        fetchFilesTrash(); // Fetch the files in the new directory
    }
}

function navigateToFolder(path){
    currentPath = path;
    fetchFilesTrash();
}

fetchFilesTrash();