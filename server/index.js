const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// In-memory "database"
let counterState = {
    count: 0,
    history: []
};

let users = []; // Store registered users

// GET current state
app.get('/api/state', (req, res) => {
    res.json(counterState);
});

// POST update state
app.post('/api/state', (req, res) => {
    const { count, history } = req.body;
    if (typeof count === 'number') {
        counterState.count = count;
    }
    if (Array.isArray(history)) {
        counterState.history = history;
    }
    res.json({ message: 'State updated successfully', state: counterState });
});

// POST signup route (assuming you meant signup and login)
app.post('/api/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Check if user already exists
    const userExists = users.some(u => u.username === username);
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    users.push({ username, password });
    res.status(201).json({ message: 'User created successfully' });
});

// POST login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ message: 'Login successful', username: user.username });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
