export const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        const { secure_url } = await response.json();

        if (!response.ok || !secure_url) {
            throw new Error('Cloudinary returned an invalid response');
        }

        return secure_url;
    } catch (error) {
        console.error('Chyba při nahrávání obrázku:', error);
        throw new Error('Nepodařilo se nahrát obrázek. Zkontrolujte připojení k internetu nebo formát souboru.');
    }
};
