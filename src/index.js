// index.js
// This is the main entry point of our application

const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('hello world!!!'));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`server is listening on port ${port}`));
