import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import '../pages/schedule.css';

function Schedule() {
    const [nizsiRounds, setNizsiRounds] = useState([]);
    const [vyssiRounds, setVyssiRounds] = useState([]);
    const [fridays, setFridays] = useState([]);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                // Načtení zápasů z Firebase pro nižší gymnázium
                const nizsiSnapshot = await db.collection('leagues').doc('2025_lower').collection('matches').get();
                const nizsiData = nizsiSnapshot.docs.map(doc => doc.data());

                // Načtení zápasů z Firebase pro vyšší gymnázium
                const vyssiSnapshot = await db.collection('leagues').doc('2025_upper').collection('matches').get();
                const vyssiData = vyssiSnapshot.docs.map(doc => doc.data());

                setNizsiRounds(nizsiData);
                setVyssiRounds(vyssiData);

                // Generování pátků pro zobrazení rozpisu
                setFridays(generateFridays(Math.max(nizsiData.length, vyssiData.length)));
            } catch (error) {
                console.error("Chyba při načítání rozpisu:", error);
            }
        };

        fetchSchedule();
    }, []);

    const generateFridays = (totalFridays) => {
        const fridays = [];
        let currentFriday = getNextFriday(new Date());
        for (let i = 0; i < totalFridays; i++) {
            fridays.push(currentFriday.toLocaleDateString('cs-CZ'));
            currentFriday.setDate(currentFriday.getDate() + 7);
        }
        return fridays;
    };

    const getNextFriday = (date) => {
        const nextFriday = new Date(date);
        nextFriday.setDate(date.getDate() + ((5 - date.getDay() + 7) % 7));
        return nextFriday;
    };

    return (
        <div className="schedule-page">
            <h2 className="schedule-title">Rozpis zápasů</h2>

            <div className="gym-section">
                <h3 className="gym-title">Nižší gymnázium</h3>
                <div className="rounds-container">
                    {nizsiRounds.map((match, index) => (
                        <div key={`nizsi-match-${index}`} className="round">
                            <h4>Kolo {index + 1}</h4>
                            <h5 className="friday-date">
                                {fridays[index]}
                            </h5>
                            <p>{match.home} vs {match.away}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="gym-section">
                <h3 className="gym-title">Vyšší gymnázium</h3>
                <div className="rounds-container">
                    {vyssiRounds.map((match, index) => (
                        <div key={`vyssi-match-${index}`} className="round">
                            <h4>Kolo {index + 1}</h4>
                            <h5 className="friday-date">
                                {index < fridays.length ? fridays[index] : fridays[fridays.length - 1]}
                            </h5>
                            <p>{match.home} vs {match.away}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Schedule;
