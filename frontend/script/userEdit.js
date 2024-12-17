const { json } = require("body-parser");

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
    try{
        const response = await fetch(`/user/${userID}`);
        const user = await response.json();

        document.getElementById('name').value = user.username;
        document.getElementById('fullName').value = user.fullName;
        document.getElementById('email').value = user.email;
        document.getElementById('role').value = user.role;
    } catch(err){
        console.err('Error fetching data', err);
    }
}

if(userID){
    fetchUserIdData(userID);
}

document.querySelector('form').addEventListener('submit', async (event) =>{
    event.preventDefault();

    const userID = getParamQuery('userID');
    const username = document.getElementById('name').value;
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role =document.getElementById('role').value;

    const updateUserData = {username, fullName, email, password, role};

    try{
        const response = await fetch('/user/edit/$userID',{
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: json.stringify(updateUserData),
        });
        const result = await response.json();
        if(result.success){
            alert('User Updated');
            window.location.href = '/frontend2/pages/adminpanel.html';
        } else{
            alert('Error updating user');
        }

    }catch(err){
        console.err('Error updating user', err);
        alert('Update user error');
    }
});