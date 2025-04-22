export const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    console.log("⬆Upload preset:", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    console.log("⬆Cloud name:", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        const result = await response.json();
        console.log("Cloudinary response:", result);

        if (!response.ok || !result.secure_url) {
            throw new Error('Cloudinary returned an invalid response');
        }

        return result.secure_url;
    } catch (error) {
        console.error('Chyba při nahrávání obrázku:', error);
        throw new Error('Nepodařilo se nahrát obrázek. Zkontrolujte připojení k internetu nebo formát souboru.');
    }
};
