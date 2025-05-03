import axios from 'axios';
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/teams`;

export const fetchTeams = async (year, division) => {
    const res = await axios.get(`${BASE_URL}/${year}/${division}/teams`);
    return res.data;
};

export const addTeam = async (year, division, data) => {
    const res = await axios.post(`${BASE_URL}/${year}/${division}/teams`, data);
    const team = res.data;
    const leagueId = `${year}_${division}`;
    const teamId = team.id;
    const playersInit = doc(db, `leagues/${leagueId}/teams/${teamId}/players/placeholder`);
    await setDoc(playersInit, {});
};

export const deleteTeam = async (year, division, id) => {
    await axios.delete(`${BASE_URL}/${year}/${division}/teams/${id}`);
};

export const updateTeam = async (year, division, id, data) => {
    await axios.put(`${BASE_URL}/${year}/${division}/teams/${id}`, data);
};

export const fetchMatchesForTeam = async (year, division, teamId) => {
    try {
        const leagueId = `${year}_${division}`;
        const matchesRef = collection(db, `leagues/${leagueId}/matches`);

        const q = query(matchesRef, where('status', '==', 'finished'));
        const snapshot = await getDocs(q);

        return snapshot.docs
            .map(doc => doc.data())
            .filter(match => match.teamA_id === teamId || match.teamB_id === teamId);
    } catch (e) {
        console.error("Failed to fetch team matches from Firestore", e);
        return [];
    }
};

