const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// 👉 Serve index.html manually (no public folder)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let dataStore = [];

// Insert API
app.post('/insert', (req, res) => {
    const value = req.body.value;

    if (!value) {
        return res.json({ message: "Empty value" });
    }

    dataStore.push(value);
    res.json({ message: "Data inserted" });
});

// Check API
app.post('/check', (req, res) => {
    const value = req.body.value;

    res.json({
        found: dataStore.includes(value)
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
