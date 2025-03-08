import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const liveBroadcastDoc = doc(db, 'liveBroadcast', 'current');

// Fetch live broadcast data (one-time fetch)
export const fetchLiveBroadcast = async () => {
    const docSnap = await getDoc(liveBroadcastDoc);
    return docSnap.exists() ? docSnap.data() : null;
};

// Subscribe to live broadcast updates (real-time updates)
export const subscribeToLiveBroadcast = (callback) => {
    return onSnapshot(liveBroadcastDoc, (docSnap) => {
        callback(docSnap.exists() ? docSnap.data() : null);
    });
};

// Update live broadcast data (admin/helper)
export const updateLiveBroadcast = async (data) => {
    await setDoc(liveBroadcastDoc, data, { merge: true });
};
