import { useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function useAuthRole() {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userRef = doc(db, 'users', user.uid);
                const snap = await getDoc(userRef);
                if (snap.exists()) {
                    setRole(snap.data().role);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { role, loading };
}
