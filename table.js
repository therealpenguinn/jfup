document.addEventListener('DOMContentLoaded', () => {
    const usertype = sessionStorage.getItem('usertype');

    if (usertype !== 'Admin') {
        window.location.href = 'login.html'; // Instantly redirect if not logged in or not admin
        return;
    }

    loadUsers();
    
    // Check for unsaved changes
    const lastEdit = localStorage.getItem('lastEdit');
    if (lastEdit) {
        try {
            const editData = JSON.parse(lastEdit);
            const timeAgo = Math.round((new Date() - new Date(editData.timestamp)) / 1000 / 60);
            
            if (confirm(`You have unsaved changes from ${timeAgo} minutes ago. Would you like to recover them?`)) {
                // Use a more compatible selector approach
                setTimeout(() => {
                    const rows = document.querySelectorAll('#tableBody tr');
                    for (const row of rows) {
                        const buttons = row.querySelectorAll('button');
                        if (buttons.length > 0 && buttons[0].onclick.toString().includes(`editUser(${editData.id}`)) {
                            // Simulate clicking the edit button
                            buttons[0].click();
                            
                            // Set the recovered values
                            setTimeout(() => {
                                document.getElementById('edit-username').value = editData.username;
                                document.getElementById('edit-branch').value = editData.branch;
                                document.getElementById('edit-usertype').value = editData.usertype;
                            }, 100);
                            break;
                        }
                    }
                }, 500); // Wait for table to load
            } else {
                localStorage.removeItem('lastEdit');
            }
        } catch (error) {
            console.error('Error recovering edit state:', error);
            localStorage.removeItem('lastEdit');
        }
    }
});

// Add window beforeunload event to warn about unsaved changes
window.addEventListener('beforeunload', (e) => {
    if (localStorage.getItem('lastEdit')) {
        e.preventDefault();
        e.returnValue = '';
    }
});

document.getElementById('back').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.getElementById('addUser').addEventListener('click', () => {
    window.location.href = 'signup.html';
});

async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            const tableBody = document.getElementById('tableBody');
            tableBody.innerHTML = '';

            data.users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.branch}</td>
                    <td>${user.usertype}</td>
                    <td>
                        <button onclick="editUser(${user.id}, event)">Edit</button>
                        <button onclick="deleteUser(${user.id}, event)">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            alert('Failed to load users');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Failed to load users: ' + error.message);
    }
}

async function deleteUser(id, event) {
    event.preventDefault();
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            const response = await fetch(`/api/users/${id}`, {  // Updated URL
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            if (result.success) {
                event.target.closest('tr').remove();
                alert('User deleted successfully');
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete user');
        }
    }
}

async function editUser(id, event) {
    if (!event || !event.target) return;
    const row = event.target.closest('tr');
    const currentData = {
        username: row.cells[0].textContent,
        branch: row.cells[1].textContent,
        usertype: row.cells[2].textContent
    };

    row.innerHTML = `
        <td><input type="text" id="edit-username" value="${currentData.username}"></td>
        <td>
            <select id="edit-branch">
                <option value="Srinagar" ${currentData.branch === 'Srinagar' ? 'selected' : ''}>Srinagar</option>
                <option value="Pune" ${currentData.branch === 'Pune' ? 'selected' : ''}>Pune</option>
                <option value="Delhi" ${currentData.branch === 'Delhi' ? 'selected' : ''}>Delhi</option>
            </select>
        </td>
        <td>
            <select id="edit-usertype">
                <option value="Normal" ${currentData.usertype === 'Normal' ? 'selected' : ''}>Normal</option>
                <option value="Admin" ${currentData.usertype === 'Admin' ? 'selected' : ''}>Admin</option>
            </select>
        </td>
        <td>
            <div style="margin-bottom: 5px;">
                <input type="checkbox" id="change-password" style="width: auto;">
                <label for="change-password">Change Password</label>
            </div>
            <input type="password" id="edit-password" placeholder="New Password" disabled>
            <button onclick="saveEdit(${id})">Save</button>
            <button onclick="loadUsers()">Cancel</button>
        </td>
    `;

    // Add event listener for checkbox
    document.getElementById('change-password').addEventListener('change', (e) => {
        document.getElementById('edit-password').disabled = !e.target.checked;
    });
}

async function saveEdit(id) {
    try {
        const data = {
            username: document.getElementById('edit-username').value.trim(),
            branch: document.getElementById('edit-branch').value,
            usertype: document.getElementById('edit-usertype').value
        };

        // Validate input
        if (!data.username || !data.branch || !data.usertype) {
            alert('All fields are required');
            return;
        }

        if (document.getElementById('change-password').checked) {
            const password = document.getElementById('edit-password').value.trim();
            if (!password) {
                alert('Password is required when password change is selected');
                return;
            }
            data.password = password;
        }

        const response = await fetch(`/api/users/${id}`, {  // Updated URL
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
            alert('User updated successfully');
            await loadUsers(); // Refresh the table
        } else {
            alert(`Failed to update user: ${result.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error details:', error);
        alert(`Update failed: ${error.message}`);
    }
}
