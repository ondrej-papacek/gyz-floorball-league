import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const liveBroadcastDoc = doc(db, 'liveBroadcast', 'currentMatch');

export const fetchLiveBroadcast = async () => {
    const docSnap = await getDoc(liveBroadcastDoc);
    return docSnap.exists() ? docSnap.data() : null;
};

export const subscribeToLiveBroadcast = (callback) => {
    return onSnapshot(liveBroadcastDoc, (docSnap) => {
        callback(docSnap.exists() ? docSnap.data() : null);
    });
};

export const updateLiveBroadcast = async (data) => {
    await setDoc(liveBroadcastDoc, data, { merge: true });
};
