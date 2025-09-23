const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample data
let users = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" }
];

// Get all users
app.get('/api/users', (req, res) => {
    res.json(users);
});

// Add new user
app.post('/api/users', (req, res) => {
    const { name, email } = req.body;
    
    const newUser = {
        id: users.length + 1,
        name: name,
        email: email
    };
    
    users.push(newUser);
    res.status(201).json(newUser);
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    users = users.filter(user => user.id !== userId);
    res.json({ message: "User deleted" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});