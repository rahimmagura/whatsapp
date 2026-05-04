const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log(err));

// Schema
const DataSchema = new mongoose.Schema({
  mobile: { type: String, unique: true },
  email: { type: String, unique: true }
});

const Data = mongoose.model('Data', DataSchema);

// UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// INSERT
app.post('/insert', async (req, res) => {
  const { mobile, email } = req.body;

  if (!mobile || !email) {
    return res.json({ message: "Both required ❌" });
  }

  let exists = await Data.findOne({
    $or: [{ mobile }, { email }]
  });

  if (exists) {
    return res.json({ message: "Already exists ❌" });
  }

  await Data.create({ mobile, email });

  res.json({ message: "Inserted ✅" });
});


// CHECK
app.post('/check', async (req, res) => {
  const { value } = req.body;

  let found = await Data.findOne({
    $or: [{ mobile: value }, { email: value }]
  });

  if (found) {
    res.json({ found: true, data: found });
  } else {
    res.json({ found: false });
  }
});


// DELETE
app.post('/delete', async (req, res) => {
  const { value } = req.body;

  let deleted = await Data.findOneAndDelete({
    $or: [{ mobile: value }, { email: value }]
  });

  if (deleted) {
    res.json({ deleted });
  } else {
    res.json({ message: "Not found ❌" });
  }
});


// PDF DOWNLOAD
app.get('/download-pdf', async (req, res) => {

  let data = await Data.find();

  const doc = new PDFDocument();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=data.pdf');

  doc.pipe(res);

  doc.fontSize(18).text("Mobile & Email List", { align: "center" });
  doc.moveDown();

  data.forEach((d, i) => {
    doc.text(`${i + 1}. Mobile: ${d.mobile} | Email: ${d.email}`);
  });

  doc.end();
});

app.listen(port, () => {
  console.log("Server running on " + port);
});
