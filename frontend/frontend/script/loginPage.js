
async function login(){
    const loginForm = document.getElementById('login-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();
            if (response.ok) {
                alert('Login successful!');
                document.cookie = `userID=${result.userID}; path=/; max-age=3600`;
                window.location.href = `/frontend2/pages/dashboard.html?userID=${result.userID}`;
                
            } else {
                alert(result.message);
            }
        } catch (err) {
            console.error('Login error:', err.message);
            alert('Something went wrong. Please try again.');
        }
    });

}

login();