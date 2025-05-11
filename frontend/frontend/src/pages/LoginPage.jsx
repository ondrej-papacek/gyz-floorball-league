import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './loginPage.css';
import {
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from 'firebase/auth';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const persistence = rememberMe
                ? browserLocalPersistence
                : browserSessionPersistence;

            await setPersistence(auth, persistence);

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (rememberMe) {
                localStorage.setItem('uid', user.uid);
                localStorage.setItem('role', 'loading');
            } else {
                sessionStorage.setItem('uid', user.uid);
                sessionStorage.setItem('role', 'loading');
            }

            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const { role } = userDoc.data();

                if (rememberMe) {
                    localStorage.setItem('role', role);
                } else {
                    sessionStorage.setItem('role', role);
                }

                if (role === 'admin') navigate('/admin');
                else if (role === 'helper') navigate('/admin');
                else setError('Vaše role není platná. Kontaktujte administrátora.');
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
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                className="login-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                <i className={showPassword ? 'bx bxs-hide' : 'bx bxs-show'}></i>
                            </span>
                        </div>
                    </div>

                    <div className="form-group remember-row">
                        <label>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            Zapamatovat si mě
                        </label>
                    </div>

                    {error && <p className="login-error">{error}</p>}
                    <button type="submit" className="login-button">Přihlásit se</button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
