import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './loginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Sign in with Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Fetch role from Firestore
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                const role = userData.role;

                // Redirect based on role
                if (role === 'admin') {
                    navigate('/admin');
                } else if (role === 'helper') {
                    navigate('/liveBroadcast');
                } else {
                    setError('Vaše role není platná. Kontaktujte administrátora.');
                }
            } else {
                setError('Uživatel nebyl nalezen v databázi.');
            }
        } catch (error) {
            console.error('Chyba při přihlášení:', error);
            setError('Přihlášení selhalo. Zkontrolujte e-mail a heslo.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2 className="login-title">Přihlášení</h2>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">E-mail:</label>
                        <input
                            type="email"
                            id="email"
                            className="login-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Heslo:</label>
                        <input
                            type="password"
                            id="password"
                            className="login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="login-error">{error}</p>}
                    <button type="submit" className="login-button">Přihlásit se</button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
