const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let dataStore = [];

// insert data
app.post('/insert', (req, res) => {
    const value = req.body.value;

    if (!value) {
        return res.json({ message: "Empty input" });
    }

    dataStore.push(value);
    res.json({ message: "Inserted successfully ✅" });
});

// check data
app.post('/check', (req, res) => {
    const value = req.body.value;

    const found = dataStore.includes(value);

    res.json({ found });
});

app.listen(port, () => {
    console.log("Server running on port " + port);
});
