// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

app.post('/save-form', (req, res) => {
  const data = req.body;
  const filePath = path.join(__dirname, 'savedData.json');
  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to save data' });
    }
    res.status(200).json({ message: 'Data saved successfully' });
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
