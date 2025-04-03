import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './manageLeague.css';
import AdminNavbar from "../components/AdminNavbar.jsx";
import { db } from '../services/firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

const ManageLeague = () => {
    const navigate = useNavigate();

    const [year, setYear] = useState('');
    const [division, setDivision] = useState('lower');
    const [leagues, setLeagues] = useState([]);

    const fetchLeagues = async () => {
        const snapshot = await getDocs(collection(db, 'leagues'));
        const list = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setLeagues(list);
    };

    useEffect(() => {
        fetchLeagues();
    }, []);

    const createLeague = async () => {
        const trimmedYear = year.trim();
        if (!trimmedYear || isNaN(trimmedYear)) return;

        const leagueId = `${trimmedYear}_${division}`;

        const leagueRef = doc(db, 'leagues', leagueId);
        await setDoc(leagueRef, {
            year: Number(trimmedYear),
            division,
            status: 'active'
        });

        await Promise.all([
            setDoc(doc(db, `leagues/${leagueId}/teams`, '__init__'), {}),
            setDoc(doc(db, `leagues/${leagueId}/matches`, '__init__'), {}),
            setDoc(doc(db, `leagues/${leagueId}/playoff`, '__init__'), {})
        ]);

        setYear('');
        setDivision('lower');
        fetchLeagues();
    };

    const handleArchiveLeague = async (id) => {
        const leagueRef = doc(db, 'leagues', id);
        await setDoc(leagueRef, { status: 'archived' }, { merge: true });
        fetchLeagues();
    };

    return (
        <>
            <AdminNavbar />
            <div className="manage-league-page">
                <h1>Správa Ligy</h1>

                <div className="add-league-form">
                    <input
                        type="text"
                        placeholder="Zadejte rok (např. 2026)"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    />
                    <select value={division} onChange={(e) => setDivision(e.target.value)}>
                        <option value="lower">Nižší</option>
                        <option value="upper">Vyšší</option>
                    </select>
                    <button onClick={createLeague}>Vytvořit Ligu</button>
                </div>

                <div className="league-list">
                    {leagues.map((league) => (
                        <div key={league.id} className="league-item">
                            <h2>{`${league.division === 'lower' ? 'Nižší' : 'Vyšší'} Gymnázium - ${league.year}`}</h2>
                            <p>Status: {league.status}</p>
                            <button onClick={() => navigate(`/admin/manage-teams/${league.id}`)}>Správa Týmů</button>
                            <button onClick={() => navigate(`/admin/manage-matches/${league.id}`)}>Správa Zápasů</button>
                            <button onClick={() => navigate(`/admin/manage-playoffs/${league.id}`)}>Správa Playoff</button>
                            <button onClick={() => handleArchiveLeague(league.id)}>Archivovat Ligu</button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ManageLeague;
