const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const PDFDocument = require('pdfkit');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
const upload = multer({ dest: 'uploads/' });

let dataStore = [];

// serve UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// ---------------- INSERT ----------------
app.post('/insert', (req, res) => {
    const { mobile, email } = req.body;

    if (!mobile || !email) {
        return res.json({ message: "Both fields required ❌" });
    }

    let exists = dataStore.find(
        d => d.mobile === mobile || d.email === email
    );

    if (exists) {
        return res.json({ message: "Already exists ❌" });
    }

    dataStore.push({ mobile, email });

    res.json({ message: "Inserted ✅" });
});


// ---------------- CHECK ----------------
app.post('/check', (req, res) => {
    const { value } = req.body;

    let found = dataStore.find(
        d => d.mobile === value || d.email === value
    );

    if (found) {
        res.json({ found: true, data: found });
    } else {
        res.json({ found: false });
    }
});


// ---------------- DELETE ----------------
app.post('/delete', (req, res) => {
    const { value } = req.body;

    let index = dataStore.findIndex(
        d => d.mobile === value || d.email === value
    );

    if (index !== -1) {
        let deleted = dataStore.splice(index, 1)[0];
        return res.json({ deleted });
    }

    res.json({ message: "Not found ❌" });
});


// ---------------- DOWNLOAD JSON ----------------
app.get('/download-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=data.json');
    res.send(JSON.stringify(dataStore, null, 2));
});


// ---------------- DOWNLOAD PDF ----------------
app.get('/download-pdf', (req, res) => {
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=data.pdf');

    doc.pipe(res);

    doc.fontSize(18).text("Mobile & Email Report", { align: "center" });
    doc.moveDown();

    dataStore.forEach((d, i) => {
        doc.fontSize(12).text(`${i + 1}. Mobile: ${d.mobile} | Email: ${d.email}`);
    });

    doc.end();
});


// ---------------- RESTORE JSON ----------------
app.post('/restore', upload.single('file'), (req, res) => {

    try {
        const raw = fs.readFileSync(req.file.path);
        const jsonData = JSON.parse(raw);

        if (!Array.isArray(jsonData)) {
            return res.json({ message: "Invalid JSON ❌" });
        }

        jsonData.forEach(item => {
            let exists = dataStore.find(
                d => d.mobile === item.mobile || d.email === item.email
            );

            if (!exists) {
                dataStore.push(item);
            }
        });

        fs.unlinkSync(req.file.path);

        res.json({ message: "Restored successfully ✅" });

    } catch (err) {
        res.json({ message: "Restore failed ❌" });
    }
});


app.listen(port, () => {
    console.log("Server running on port " + port);
});
