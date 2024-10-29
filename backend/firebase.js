// backend/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./gyz-floorball-league-firebase-adminsdk-yi33x-5e8d104d29.json');

// Inicializace Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
module.exports = db;