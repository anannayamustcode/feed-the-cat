const API_URL = 'http://localhost:5000/api';

// DOM elements
const userForm = document.getElementById('userForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const usersContainer = document.getElementById('users');

// Load users on page load
document.addEventListener('DOMContentLoaded', loadUsers);

// Add user form submit
userForm.addEventListener('submit', addUser);

async function loadUsers() {
    try {
        usersContainer.innerHTML = '<div class="loading">Loading users...</div>';
        
        const response = await fetch(`${API_URL}/users`);
        const users = await response.json();
        
        displayUsers(users);
    } catch (error) {
        usersContainer.innerHTML = '<div class="loading">Error loading users</div>';
        console.error('Error:', error);
    }
}

function displayUsers(users) {
    if (users.length === 0) {
        usersContainer.innerHTML = '<div class="loading">No users found</div>';
        return;
    }
    
    usersContainer.innerHTML = users.map(user => `
        <div class="user-card">
            <div class="user-info">
                <strong>${user.name}</strong> - ${user.email}
            </div>
            <button class="delete-btn" onclick="deleteUser(${user.id})">Delete</button>
        </div>
    `).join('');
}

async function addUser(e) {
    e.preventDefault();
    
    const userData = {
        name: nameInput.value,
        email: emailInput.value
    };
    
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            nameInput.value = '';
            emailInput.value = '';
            loadUsers();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteUser(userId) {
    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadUsers();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}