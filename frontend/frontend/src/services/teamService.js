import axios from 'axios';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/teams`;

export const fetchTeams = async (year, division) => {
    const res = await axios.get(`${BASE_URL}/${year}/${division}/teams`);
    return res.data;
};

export const addTeam = async (year, division, data) => {
    // 1. Call your API
    await axios.post(`${BASE_URL}/${year}/${division}/teams`, data);

    // 2. Prepare Firestore enhancement
    const leagueId = `${year}_${division}`;
    const teamId = data.name.toLowerCase().replace(/\s+/g, '_');

    // 3. Add players/__init__ to team
    const playersInit = doc(db, `leagues/${leagueId}/teams/${teamId}/players/__init__`);
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
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/matches/${year}/${division}/team/${teamId}`);
        return res.data;
    } catch (e) {
        console.error("Failed to fetch team matches", e);
        return [];
    }
};
