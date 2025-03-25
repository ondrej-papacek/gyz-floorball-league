import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/news`;

// Fetch all news articles
export const fetchNews = async () => {
    try {
        const response = await axios.get(BASE_URL);
        return response.data.map(article => ({
            ...article,
            date: article.date ? new Date(article.date).toISOString() : null,
        }));
    } catch (error) {
        console.error('Error fetching news:', error);
        throw new Error('Failed to fetch news.');
    }
};

// Fetch only the latest 3 news articles for NewsSection.jsx
export const fetchLatestNews = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/latest`);
        return response.data.map(article => ({
            ...article,
            date: article.date ? new Date(article.date).toISOString() : null,
        }));
    } catch (error) {
        console.error('Error fetching latest news:', error);
        throw new Error('Failed to fetch latest news.');
    }
};

// Add a new news article
export const addNews = async (newsData) => {
    try {
        const formattedNewsData = {
            ...newsData,
            date: new Date(newsData.date).toISOString(),
        };

        const response = await axios.post(BASE_URL, formattedNewsData);
        return response.data;
    } catch (error) {
        console.error('Chyba při přidávání novinky:', error);
        throw new Error('Nepodařilo se přidat novinku.');
    }
};

// Update an existing news article
export const updateNews = async (id, updatedData) => {
    try {
        const formattedUpdatedData = {
            ...updatedData,
            date: new Date(updatedData.date).toISOString(),
        };

        const response = await axios.put(`${BASE_URL}/${id}`, formattedUpdatedData);
        return response.data;
    } catch (error) {
        console.error('Chyba při úpravě novinky:', error);
        throw new Error('Nepodařilo se upravit novinku.');
    }
};

// Delete a news article
export const deleteNews = async (id) => {
    try {
        const response = await axios.delete(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Chyba při mazání novinky:', error);
        throw new Error('Nepodařilo se smazat novinku.');
    }
};
