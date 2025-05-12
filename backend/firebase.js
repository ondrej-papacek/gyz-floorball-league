const admin = require('firebase-admin');

const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_CONFIG_BASE64, 'base64').toString('utf8')
);

if (!admin.apps.length) {
   admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
   });
}

const db = admin.firestore();

module.exports = { admin, db };
