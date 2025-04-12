document.addEventListener('DOMContentLoaded', () => {
    const usertype = sessionStorage.getItem('usertype');

    if (usertype !== 'Admin') {
        window.location.href = 'login.html'; // Instantly redirect if not logged in or not admin
        return;
    }
});

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        branch: document.getElementById('branch').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        usertype: document.getElementById('usertype').value
    };

    if (!data.branch || !data.username || !data.password || !data.usertype) {
        alert('All fields are required');
        return;
    }

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            alert('Signup successful');
            window.location.href = 'login.html';
        } else {
            alert(result.error || 'Signup failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed: ' + error.message);
    }
});

document.getElementById('showLogin').addEventListener('click', () => {
    window.location.href = 'login.html';
});
