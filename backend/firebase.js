const admin = require('firebase-admin');

const raw = process.env.FIREBASE_CONFIG;
const serviceAccount = JSON.parse(raw.replace(/\\n/g, '\n'));

if (!admin.apps.length) {
   admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
   });
}

const db = admin.firestore();
module.exports = db;
