import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/docx';

export const generateRoundPreview = async (roundData) => {
    const response = await axios.post(`${API_URL}/generate-round`, roundData, {
        responseType: 'blob',
    });
    triggerDownload(response.data, 'rozpis-kola.docx');
};

export const generateSeasonSummary = async (seasonData) => {
    const response = await axios.post(`${API_URL}/generate-summary`, seasonData, {
        responseType: 'blob',
    });
    triggerDownload(response.data, 'shrnutí-sezóny.docx');
};

const triggerDownload = (blobData, filename) => {
    const url = window.URL.createObjectURL(new Blob([blobData]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
};
