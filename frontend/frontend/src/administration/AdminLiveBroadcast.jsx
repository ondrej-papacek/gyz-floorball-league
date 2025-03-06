import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './adminLiveBroadcast.css';

function AdminLiveBroadcast() {
    const [liveData, setLiveData] = useState({
        teamA: '',
        teamB: '',
        scoreA: 0,
        scoreB: 0,
        periodInfo: '',
        timeLeft: '20:00',
    });

    useEffect(() => {
        const fetchLiveBroadcast = async () => {
            const broadcastDoc = doc(db, 'liveBroadcast', 'currentMatch');
            const docSnapshot = await getDoc(broadcastDoc);

            if (docSnapshot.exists()) {
                setLiveData(docSnapshot.data());
            } else {
                console.error('Živý přenos nebyl nalezen.');
            }
        };

        fetchLiveBroadcast();
    }, []);

    const updateLiveBroadcast = async (updatedData) => {
        const broadcastDoc = doc(db, 'liveBroadcast', 'currentMatch');
        await setDoc(broadcastDoc, updatedData, { merge: true });
        setLiveData(updatedData);
    };

    const handleFieldChange = (field, value) => {
        const updatedData = { ...liveData, [field]: value };
        updateLiveBroadcast(updatedData);
    };

    const handleScoreChange = (team, increment) => {
        const updatedData = { ...liveData, [team]: liveData[team] + increment };
        updateLiveBroadcast(updatedData);
    };

    return (
        <div className="admin-live-broadcast-page">
            <h2 className="admin-live-broadcast-title">Administrace Živého Přenosu</h2>
            <div className="live-broadcast-controls">
                <div className="team-control">
                    <h3>Tým A</h3>
                    <input
                        type="text"
                        value={liveData.teamA}
                        onChange={(e) => handleFieldChange('teamA', e.target.value)}
                        placeholder="Název týmu A"
                    />
                    <p>Skóre: {liveData.scoreA}</p>
                    <button onClick={() => handleScoreChange('scoreA', 1)}>+1</button>
                    <button onClick={() => handleScoreChange('scoreA', -1)}>-1</button>
                </div>

                <div className="timer-control">
                    <h3>Čas</h3>
                    <input
                        type="text"
                        value={liveData.timeLeft}
                        onChange={(e) => handleFieldChange('timeLeft', e.target.value)}
                        placeholder="Čas (např. 19:45)"
                    />
                </div>

                <div className="team-control">
                    <h3>Tým B</h3>
                    <input
                        type="text"
                        value={liveData.teamB}
                        onChange={(e) => handleFieldChange('teamB', e.target.value)}
                        placeholder="Název týmu B"
                    />
                    <p>Skóre: {liveData.scoreB}</p>
                    <button onClick={() => handleScoreChange('scoreB', 1)}>+1</button>
                    <button onClick={() => handleScoreChange('scoreB', -1)}>-1</button>
                </div>
            </div>
        </div>
    );
}

export default AdminLiveBroadcast;
