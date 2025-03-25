import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/news`;

// Fetch teams from Firestore
export const fetchTeams = async (year, division) => {
    try {
        const response = await axios.get(`${BASE_URL}/${year}/${division}/teams`);
        return response.data;
    } catch (error) {
        console.error('Error fetching teams:', error);
        return [];
    }
};
