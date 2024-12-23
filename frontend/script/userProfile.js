function getCookie(name){
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function getParamQuery(name){
    const urlParam = new URLSearchParams(window.location.search);
    return urlParam.get(name);
}

const userID = getParamQuery('userID');

async function fetchUserIdData(userID) {
    const loginID = getCookie('loginID')
    if (!loginID) {
        window.location.href = '/frontend/pages/loginadmin.html'; // Redirect to login if no userID found
        return;
    }
    try{
        const response = await fetch(`/user/${userID}`, {
            method: 'GET',
            headers: {
                'user-id': loginID
            },
            credentials: 'include'
        });
        const data = await response.json();
        if(data.success && data.user){
            const user = data.user;
            console.log(user);
            document.getElementById('name').value = user.username;
            document.getElementById('fullName').value = user.fullName;
            document.getElementById('email').value = user.email;
            document.getElementById('role').value = user.role;
        } else{
            console.log('Failed to Fetch user Data');
        }

    } catch(error){
        console.error('Error fetching data', error);
    }
}

if(userID){
    fetchUserIdData(userID);
}

async function editUser() {
    const loginID = getCookie('loginID')
    jsonData = {
     userID : getParamQuery('userID'),
     username : document.getElementById('name').value,
     fullName : document.getElementById('fullName').value,
     email : document.getElementById('email').value,
     password : document.getElementById('password').value,
     role : document.getElementById('role').value,
    }

    try{
        const response = await fetch(`/user/edit/${userID}`,{
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'user-id': loginID
            },
            body: JSON.stringify(jsonData),
        });
        const result = await response.json();
        if(result.success){
            alert('User Updated');
            window.location.href = `/frontend/pages/dashboard.html?loginID=${loginID}`;
        } else{
            alert('Error updating user');
        }

    }catch(error){
        console.error('Error updating user', error);
        alert('Update user error');
    }
};