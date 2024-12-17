function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function deleteUser(userID) {
    try {
        const response = await fetch(`/user/delete${userID}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            alert('User deleted successfully!');
            window.location.reload();
        } else {
            alert('Error deleting user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
    }
}

async function editUser(userID) {
    const username = document.getElementById()

    if (username && email && password && role) {
        try {
            const response = await fetch(`/user/edit${userID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password, role })
            });

            const result = await response.json();
            if (result.success) {
                alert('User edited successfully!');
                window.location.reload();
            } else {
                alert('Error editing user');
            }
        } catch (error) {
            console.error('Error editing user:', error);
            alert('Error editing user');
        }
    }
}

async function addUser() {
    console.log("Button clicked, addUser function triggered");
    const jsonData = {
        username: document.getElementById('username').value,
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value,
    };

    if (jsonData.username && jsonData.fullName && jsonData.email && jsonData.password && jsonData.role) {
        try {
            const response = await fetch(`/user/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body:  JSON.stringify(jsonData) // Correctly encode the data
            });

            const result = await response.json();
            if (result.success) {
                alert('User added successfully!');
                window.location.reload();
            } else {
                alert('Error adding user');
            }
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Error adding user');
        }
    }
}

// Fetch user to show in admin panel
async function fetchUser() {
    try {
        const response = await fetch('/user/list');
        const users = await response.json();
        renderUserTable(users);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Render User table to show as dynamic html
function renderUserTable(users){
    const table = document.querySelector('.user-table');

    table.innerHTML =`
        <div class="table-header">
            <div>Username</div>
            <div>Full Name</div>
            <div>Email</div>
            <div>Role</div>
        </div>
    `;

    // Set loop for making dynamic html per user
    users.forEach((user) => {
        const row = document.createElement('div');
        row.classList.add('table-row');
        row.innerHTML = `
            <div id="username">${user.username}</div>
            <div id="fullname">${user.fullName}</div>
            <div id="email">${user.email}</div>
            <div id="role">${user.role}</div>
            <div>
                <button class="btn edit" data-id="${user.userID}">Edit</button>
                <button class="btn delete" data-id=${user.userID}>Delete</button>
            </div>
        `;
        table.appendChild(row);
    });
}

// Listen to button click in dynamic html
function buttonListener(){
    document.querySelectorAll('.btn.delete').forEach(button => {
        button.addEventListener('click', (event) =>{
            const userID = event.target.dataset.id;
            deleteUser(userID);
        });
    });

    document.querySelectorAll('.btn.edit').forEach(button => {
        button.addEventListener('click', (event) =>{
            const userID = event.target.dataset.id;
            editUser(userID);
        });
    });

    document.querySelector('.user-table').addEventListener('click', (event) => {
        if (event.target.classList.contains('edit')) {
            const userID = event.target.getAttribute('data-id');  // Get the userID from the data-id attribute

            // Redirect to the edit profile page, passing the userID as a query parameter
            window.location.href = `/frontend2/pages/useredit.html?userID=${userID}`;
        }
    });
}

fetchUser();
