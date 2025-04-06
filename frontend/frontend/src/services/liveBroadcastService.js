// liveBroadcastService.js
import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const liveBroadcastDoc = doc(db, 'liveBroadcast', 'currentMatch');

// Fetch once (optional)
export const fetchLiveBroadcast = async () => {
    const docSnap = await getDoc(liveBroadcastDoc);
    return docSnap.exists() ? docSnap.data() : null;
};

// Real-time updates
export const subscribeToLiveBroadcast = (callback) => {
    return onSnapshot(liveBroadcastDoc, (docSnap) => {
        callback(docSnap.exists() ? docSnap.data() : null);
    });
};

// Optional: Admin update (if needed from outside AdminLiveBroadcast.jsx)
export const updateLiveBroadcast = async (data) => {
    await setDoc(liveBroadcastDoc, data, { merge: true });
};
