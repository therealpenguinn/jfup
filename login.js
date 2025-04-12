document.addEventListener('DOMContentLoaded', () => {
    const username = sessionStorage.getItem('username');
    const usertype = sessionStorage.getItem('usertype');
    const branch = sessionStorage.getItem('branch');

    // If user is already logged in, redirect to index.html
    if (username && usertype && branch) {
        window.location.href = 'index.html';
        return;
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const branch = document.getElementById('branch').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!branch || !username || !password) {
        alert('All fields are required');
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ branch, username, password })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
            sessionStorage.setItem('usertype', result.usertype);
            sessionStorage.setItem('username', result.username);
            sessionStorage.setItem('branch', branch);
            window.location.href = 'index.html';
        } else {
            alert(result.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
});
