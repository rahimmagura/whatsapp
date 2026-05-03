const express = require('express');
const path = require('path');
const PDFDocument = require('pdfkit');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// database
let dataStore = [];

/*
FORMAT:
{
  mobile: "",
  email: ""
}
*/

// INSERT
app.post('/insert', (req, res) => {
    const { mobile, email } = req.body;

    if (!mobile || !email) {
        return res.json({ message: "Both fields required ❌" });
    }

    // duplicate check
    let exists = dataStore.find(
        item => item.mobile === mobile || item.email === email
    );

    if (exists) {
        return res.json({ message: "Already exists ❌" });
    }

    dataStore.push({ mobile, email });

    res.json({ message: "Inserted successfully ✅" });
});

// CHECK
app.post('/check', (req, res) => {
    const { value } = req.body;

    let found = dataStore.find(
        item => item.mobile === value || item.email === value
    );

    if (found) {
        res.json({ found: true, data: found });
    } else {
        res.json({ found: false });
    }
});

// DELETE
app.post('/delete', (req, res) => {
    const { value } = req.body;

    let index = dataStore.findIndex(
        item => item.mobile === value || item.email === value
    );

    if (index !== -1) {
        let deleted = dataStore.splice(index, 1);
        return res.json({ deleted: deleted[0] });
    }

    res.json({ message: "Not found ❌" });
});

// DOWNLOAD PDF
app.get('/download', (req, res) => {

    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=data.pdf');

    doc.pipe(res);

    doc.fontSize(20).text("Mobile Number & Email List", { align: "center" });
    doc.moveDown();

    dataStore.forEach((item, i) => {
        doc.fontSize(12).text(`${i + 1}. Mobile: ${item.mobile} | Email: ${item.email}`);
    });

    doc.end();
});

app.listen(port, () => {
    console.log("Server running on " + port);
});
