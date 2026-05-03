const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

let dataStore = []; // temporary storage

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

    if (dataStore.includes(value)) {
        res.json({ found: true });
    } else {
        res.json({ found: false });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
