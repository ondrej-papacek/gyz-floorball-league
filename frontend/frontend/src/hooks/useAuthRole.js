import { useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Custom hook to fetch the current user's role from Firestore.
 * Returns role and loading state.
 */
export function useAuthRole() {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                if (!cancelled) {
                    setRole(null);
                    setLoading(false);
                }
                return;
            }

            try {
                const userRef = doc(db, 'users', user.uid);
                const snap = await getDoc(userRef);

                if (!cancelled) {
                    if (snap.exists()) {
                        setRole(snap.data().role);
                    } else {
                        setRole(null); // no role found
                    }
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error loading user role:', error);
                if (!cancelled) {
                    setRole(null);
                    setLoading(false);
                }
            }
        });

        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, []);

    return { role, loading };
}
