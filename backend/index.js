// backend/index.js
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Firebase inicializace
require('./firebase');

// Načtení rout
const leagueRoutes = require('./routes/leagueRoutes');
const userRoutes = require('./routes/userRoutes');

// Použití rout pro API
app.use('/api/leagues', leagueRoutes);
app.use('/api/users', userRoutes);

// Spuštění serveru
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});