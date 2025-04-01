import axios from 'axios';

const BASE = `${import.meta.env.VITE_API_URL}/api/playoff`;

export const getPlayoffRounds = async (year, division) =>
    (await axios.get(`${BASE}/${year}/${division}/playoff`)).data;

export const saveRound = async (year, division, round, matches) =>
    (await axios.post(`${BASE}/${year}/${division}/playoff/${round}`, { matches })).data;

export const updateRound = async (year, division, round, matches) =>
    (await axios.put(`${BASE}/${year}/${division}/playoff/${round}`, { matches }));

export const deleteRound = async (year, division, round) =>
    (await axios.delete(`${BASE}/${year}/${division}/playoff/${round}`));
