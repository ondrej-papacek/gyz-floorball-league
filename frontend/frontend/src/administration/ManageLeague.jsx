import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './manageLeague.css';
import AdminNavbar from "../components/AdminNavbar.jsx";
import { db } from '../services/firebase';
import { deleteDoc, collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { useLeague } from '../services/leagueContext';
import { generateSeasonSummary } from '../services/docxService';

const ManageLeague = () => {
    const navigate = useNavigate();
    const { setSelectedLeague } = useLeague();

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
            setDoc(doc(db, `leagues/${leagueId}/teams`, 'placeholder'), {}),
            setDoc(doc(db, `leagues/${leagueId}/matches`, 'placeholder'), {}),
            setDoc(doc(db, `leagues/${leagueId}/playoff/rounds`), {}),
            setDoc(doc(db, `leagues/${leagueId}/playoff/bracketMatches`, 'placeholder'), {})
        ]);

        setYear('');
        setDivision('lower');
        await fetchLeagues();
    };

    const handleDeleteLeague = async (id) => {
        const confirmed = window.confirm("Opravdu chcete odstranit tuto ligu? Tento krok je nevratný.");
        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, 'leagues', id));
            alert("Liga byla úspěšně odstraněna.");
            await fetchLeagues();
        } catch (error) {
            console.error("Chyba při mazání ligy:", error);
            alert("Nepodařilo se smazat ligu.");
        }
    };

    const handleArchiveLeague = async (id) => {
        const leagueRef = doc(db, 'leagues', id);
        await setDoc(leagueRef, { status: 'archived' }, { merge: true });
        await fetchLeagues();
    };

    const handleReactivateLeague = async (id) => {
        const leagueRef = doc(db, 'leagues', id);
        await setDoc(leagueRef, { status: 'active' }, { merge: true });
        await fetchLeagues();
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

                            <button
                                disabled={league.status === 'archived'}
                                onClick={() => {
                                    setSelectedLeague(league);
                                    navigate('/admin/manage-teams');
                                }}
                            >
                                Správa Týmů
                            </button>

                            <button
                                disabled={league.status === 'archived'}
                                onClick={() => {
                                    setSelectedLeague(league);
                                    navigate('/admin/manage-schedule');
                                }}
                            >
                                Správa Zápasů
                            </button>

                            <button
                                disabled={league.status === 'archived'}
                                onClick={() => {
                                    setSelectedLeague(league);
                                    navigate('/admin/manage-playoffs');
                                }}
                            >
                                Správa Playoff
                            </button>

                            {league.status === 'archived' ? (
                                <button onClick={() => handleReactivateLeague(league.id)}>Obnovit Ligu</button>
                            ) : (
                                <button onClick={() => handleArchiveLeague(league.id)}>Archivovat Ligu</button>
                            )}

                            <button onClick={() => generateSeasonSummary({
                                year: league.year,
                                division: league.division
                            })}>
                                Generovat souhrn
                            </button>

                            <button
                                className="delete-league-btn"
                                onClick={() => handleDeleteLeague(league.id)}
                            >
                                Odstranit Ligu
                            </button>

                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ManageLeague;
