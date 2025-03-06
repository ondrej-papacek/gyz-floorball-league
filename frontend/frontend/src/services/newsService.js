import axios from 'axios';

// Backend Base URL (Update if necessary, e.g., when deployed)
const BASE_URL = 'http://localhost:5000/api/news'; // Change to your backend domain when deployed

// Fetch all news articles
export const fetchNews = async () => {
    try {
        const response = await axios.get(BASE_URL); // GET request to /api/news
        return response.data;
    } catch (error) {
        console.error('Chyba při načítání novinek:', error);
        throw new Error('Nepodařilo se načíst novinky.');
    }
};

// Add a new news article
export const addNews = async (newsData) => {
    try {
        const response = await axios.post(BASE_URL, newsData); // POST request to /api/news
        return response.data;
    } catch (error) {
        console.error('Chyba při přidávání novinky:', error);
        throw new Error('Nepodařilo se přidat novinku.');
    }
};

// Update an existing news article
export const updateNews = async (id, updatedData) => {
    try {
        const response = await axios.put(`${BASE_URL}/${id}`, updatedData); // PUT request to /api/news/:id
        return response.data;
    } catch (error) {
        console.error('Chyba při úpravě novinky:', error);
        throw new Error('Nepodařilo se upravit novinku.');
    }
};

// Delete a news article
export const deleteNews = async (id) => {
    try {
        const response = await axios.delete(`${BASE_URL}/${id}`); // DELETE request to /api/news/:id
        return response.data;
    } catch (error) {
        console.error('Chyba při mazání novinky:', error);
        throw new Error('Nepodařilo se smazat novinku.');
    }
};
