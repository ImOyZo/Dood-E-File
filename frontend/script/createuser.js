// Cookie (Authentication)
function getCookie(name){
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function addUser() {
    const loginID = getCookie('loginID');

    if (!loginID) {
        window.location.href = '/frontend2/pages/login.html';
        return;
    }
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
                    'user-id': loginID
                },
                credentials: 'include',
                body:  JSON.stringify(jsonData) // Correctly encode the data
            });

            const result = await response.json();
            if (result.success) {
                alert('User added successfully!');
                window.location.href = '/frontend2/pages/usermanagement.html'
            } else {
                alert('Error adding user');
            }
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Error adding user');
        }
    }
}