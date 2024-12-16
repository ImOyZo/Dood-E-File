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
    const username = prompt("Enter new username:");
    const email = prompt("Enter new email:");
    const password = prompt("Enter new password:");
    const role = prompt("Enter new role:");

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
    document.getElementById('username').value;
    document.getElementById('email').value;
    document.getElementById('fullName').value;
    document.getElementById('password').value;

    if (username && email && password && role) {
        try {
            const response = await fetch(`/user/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password, role })
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

async function fetchUser() {
    try {
        const response = await fetch('/user/list');
        const users = await response.json();
        // Render users dynamically here in the UI
        console.log(users);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

fetchUser();
