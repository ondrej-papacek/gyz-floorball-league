import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/docx';

export const generateRoundPreview = async (roundData) => {
    try {
        const response = await axios.post(`${API_URL}/generate-round`, roundData, {
            responseType: 'blob',
        });
        triggerDownload(response.data, 'rozpis-kola.docx');
    } catch (error) {
        const msg = error?.response?.data?.message || 'Chyba při generování dokumentu (kolo).';
        console.error('DOCX generation failed:', msg);
        alert(msg);
        throw error;
    }
};

export const generateSeasonSummary = async (seasonData) => {
    try {
        const response = await axios.post(`${API_URL}/generate-summary`, seasonData, {
            responseType: 'blob',
        });
        triggerDownload(response.data, 'shrnutí-sezóny.docx');
    } catch (error) {
        const msg = error?.response?.data?.message || 'Chyba při generování dokumentu (souhrn).';
        console.error('DOCX generation failed:', msg);
        alert(msg);
        throw error;
    }
};