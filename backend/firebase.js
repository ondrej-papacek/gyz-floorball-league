// backend/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializace Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://gyz-floorball-league.firebaseio.com"
});

const db = admin.firestore();
module.exports = db;