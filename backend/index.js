﻿const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.send('Hello from the Floorball League Backend!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});