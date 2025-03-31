import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/teams`;

export const fetchTeams = async (year, division) => {
    const res = await axios.get(`${BASE_URL}/${year}/${division}/teams`);
    return res.data;
};

export const addTeam = async (year, division, data) => {
    await axios.post(`${BASE_URL}/${year}/${division}/teams`, data);
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
