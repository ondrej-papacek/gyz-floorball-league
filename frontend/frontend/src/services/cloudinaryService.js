export const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET); // Upload preset from .env
    formData.append('cloud_name', process.env.REACT_APP_CLOUDINARY_CLOUD_NAME); // Cloud name from .env

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error('Chyba při nahrávání obrázku na Cloudinary.');
        }

        const data = await response.json();
        return data.secure_url; // This is the URL of the uploaded image
    } catch (error) {
        console.error('Chyba při nahrávání obrázku:', error);
        throw new Error('Nepodařilo se nahrát obrázek. Zkontrolujte připojení k internetu nebo formát souboru.');
    }
};
