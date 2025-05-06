import axios from 'axios';

const API_BASE = 'https://gyz-floorball-league.onrender.com/api/schedule';

export const fetchMatches = async (year, division) => {
    const res = await axios.get(`${API_BASE}/${year}/${division}/matches`);
    return res.data;
};

export const updateMatch = async (year, division, matchId, data) => {
    return axios.put(`${API_BASE}/${year}/${division}/matches/${matchId}`, data);
};

export const deleteMatch = async (year, division, matchId) => {
    return axios.delete(`${API_BASE}/${year}/${division}/matches/${matchId}`);
};

export const cancelRound = async (year, division, round) => {
    return axios.post(`${API_BASE}/${year}/${division}/round/${round}/cancel`);
};

export const updateRoundDate = async (year, division, round, date) => {
    return axios.put(`${API_BASE}/${year}/${division}/round/${round}/date`, { date });
};

export const deleteRound = async (year, division, round) => {
    return axios.delete(`${API_BASE}/${year}/${division}/round/${round}`);
};

export const generateSchedule = async (year, division, startDate) => {
    return axios.post(`${API_BASE}/generate-schedule`, {
        year,
        division,
        startDate
    });
};
