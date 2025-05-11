import axios from 'axios';
import { triggerDownload } from '../utils/download';

const API_URL = import.meta.env.VITE_API_URL + '/api/rtf';

export const generateRoundPreview = async (roundData) => {
    try {
        const response = await axios.post(`${API_URL}/generate-round`, roundData, {
            responseType: 'blob',
        });
        triggerDownload(response.data, 'rozpis-kola.rtf');
    } catch (error) {
        const msg = error?.response?.data?.message || 'Chyba při generování dokumentu (kolo).';
        console.error('RTF generation failed:', msg);
        alert(msg);
        throw error;
    }
};

export const generateSeasonSummary = async (seasonData) => {
    try {
        const response = await axios.post(`${API_URL}/generate-summary`, seasonData, {
            responseType: 'blob',
        });
        triggerDownload(response.data, 'shrnutí-sezóny.rtf');
    } catch (error) {
        const msg = error?.response?.data?.message || 'Chyba při generování dokumentu (souhrn).';
        console.error('RTF generation failed:', msg);
        alert(msg);
        throw error;
    }
};
