import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/teams'; // Adjust if deployed

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
