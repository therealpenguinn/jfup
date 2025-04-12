document.addEventListener('DOMContentLoaded', () => {
    const username = sessionStorage.getItem('username');
    const usertype = sessionStorage.getItem('usertype');
    const branch = sessionStorage.getItem('branch');

    if (!username || !usertype || !branch) {
        sessionStorage.clear();
        window.location.href = 'login.html'; // Instantly redirect if not logged in
        return;
    }

    document.getElementById('userDisplay').textContent = `${username} (${branch})`;

    if (usertype === 'Admin') {
        const adminLink = document.createElement('a');
        adminLink.href = 'table.html';
        adminLink.textContent = 'Access Admin Panel';
        adminLink.className = 'admin-button';
        document.getElementById('adminPanel').appendChild(adminLink);
    } else {
        const restrictedPages = ['table.html', 'signup.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (restrictedPages.includes(currentPage)) {
            window.location.href = 'index.html'; // Instantly redirect
        }
    }

    document.getElementById('logout').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
});
