// src/app.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(bodyParser.json());

const routes = require('./routes'); // Adjusted for src/routes/index.js

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/api', routes);

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
