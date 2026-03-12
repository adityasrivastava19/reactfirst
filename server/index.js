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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
