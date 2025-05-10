import React, { useState, useEffect } from 'react';
import {
    collection,
    getDocs
} from 'firebase/firestore';
import { db } from '../services/firebase';
import './manageAccounts.css';
import AdminNavbar from "../components/AdminNavbar.jsx";

const ManageAccounts = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'helper' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const passwordChecks = [
        {
            label: 'Délka alespoň 10 znaků',
            test: (pwd) => pwd.length >= 10,
        },
        {
            label: 'Obsahuje speciální znak (@!?* apod.)',
            test: (pwd) => /[@!?\-*._]/.test(pwd),
        },
        {
            label: 'Nepoužívejte zakázané znaky (např. ", <, >, \\)',
            test: (pwd) => !/[<>"'\\]/.test(pwd),
        },
        {
            label: 'Obsahuje číslici',
            test: (pwd) => /\d/.test(pwd),
        },
        {
            label: 'Obsahuje malé písmeno',
            test: (pwd) => /[a-z]/.test(pwd),
        },
        {
            label: 'Obsahuje velké písmeno',
            test: (pwd) => /[A-Z]/.test(pwd),
        },
    ];

    const currentUID = localStorage.getItem('uid');

    useEffect(() => {
        const loadUsers = async () => {
            const snapshot = await getDocs(collection(db, 'users'));
            const loadedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(loadedUsers);
            setLoading(false);
        };
        loadUsers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Opravdu chcete tohoto uživatele odstranit?')) {
            try {
                await fetch(`https://gyz-floorball-league.onrender.com/api/users/${id}`, {
                    method: 'DELETE',
                });
                setUsers(users.filter(u => u.id !== id));
            } catch (err) {
                console.error('Chyba při mazání:', err);
                alert('Nepodařilo se smazat uživatele.');
            }
        }
    };

    const handleRoleChange = async (id, newRole) => {
        await fetch(`https://gyz-floorball-league.onrender.com/api/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role: newRole }),
        });
        setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch('https://gyz-floorball-league.onrender.com/api/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message || 'Chyba serveru při vytváření uživatele');
            }

            const data = await response.json();

            setUsers([...users, { id: data.uid, email: newUser.email, role: newUser.role }]);
            setSuccess('Uživatel byl úspěšně vytvořen.');
            setNewUser({ email: '', password: '', role: 'helper' });

        } catch (err) {
            console.error('Chyba při vytváření účtu:', err);
            setError(err.message);
        }
    };

    return (
        <>
            <AdminNavbar />
            <div className="manage-accounts">
                <h2>Správa uživatelů</h2>

                <form className="create-user-form" onSubmit={handleCreateUser} aria-label="Vytvořit uživatele">
                    <h3>Přidat nový účet</h3>

                    <div className="form-row">
                        <input
                            type="email"
                            placeholder="Email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value.trim() })}
                            required
                        />

                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Heslo"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                required
                            />
                            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                <i className={`bx ${showPassword ? 'bxs-hide' : 'bxs-show'}`}></i>
            </span>
                        </div>

                        <select
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        >
                            <option value="admin">Admin</option>
                            <option value="helper">Helper</option>
                        </select>
                    </div>

                    <p className="password-hint">Heslo musí splňovat následující kritéria:</p>

                    <ul className="password-checklist">
                        {passwordChecks.map((rule, index) => {
                            const passed = rule.test(newUser.password);
                            return (
                                <li key={index}>
                    <span className={passed ? 'check-icon green' : 'check-icon red'}>
                        {passed ? '✔' : '✖'}
                    </span>{' '}
                                    {rule.label}
                                </li>
                            );
                        })}
                    </ul>

                    <div className="submit-wrapper">
                        <button
                            type="submit"
                            disabled={!passwordChecks.every(rule => rule.test(newUser.password))}
                        >
                            + Přidat účet
                        </button>
                    </div>

                    {error && <p className="error-msg">{error}</p>}
                    {success && <p className="success-msg">{success}</p>}
                </form>

                <hr />

                {loading ? (
                    <p>Načítání uživatelů...</p>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Akce</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.email}</td>
                                <td>
                                    {user.id === currentUID ? (
                                        <span>{user.role}</span>
                                    ) : (
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="helper">Helper</option>
                                        </select>
                                    )}
                                </td>
                                <td>
                                    {user.id !== currentUID && (
                                        <button onClick={() => handleDelete(user.id)}>🗑️</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
};

export default ManageAccounts;
