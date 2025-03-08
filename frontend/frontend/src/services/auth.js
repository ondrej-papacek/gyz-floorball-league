import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { auth } from './firebase';

// Function to register a user
export const registerUser = async (email, password, role) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Save user details in Firestore
    await setDoc(doc(db, 'users', uid), {
        email,
        role,
        uid,
    });
};
