import axios from 'axios';

const API_BASE = 'https://gyz-floorball-league.onrender.com/api/players';

export const getPlayers = async (year, division, teamId) => {
    const res = await axios.get(`${API_BASE}/${year}/${division}/teams/${teamId}/players`);
    return res.data;
};

export const addPlayer = async (year, division, teamId, playerId, playerData) => {
    const res = await axios.post(`${API_BASE}/${year}/${division}/teams/${teamId}/players/${playerId}`, playerData);
    return res.data;
};

export const deletePlayer = async (year, division, teamId, playerId) => {
    const res = await axios.delete(`${API_BASE}/${year}/${division}/teams/${teamId}/players/${playerId}`);
    return res.data;
};

export const updatePlayer = async (year, division, teamId, playerId, playerData) => {
    const res = await axios.put(`${API_BASE}/${year}/${division}/teams/${teamId}/players/${playerId}`, playerData);
    return res.data;
};
