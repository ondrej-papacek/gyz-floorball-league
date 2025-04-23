import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET': JSON.stringify(process.env.VITE_CLOUDINARY_UPLOAD_PRESET),
    'import.meta.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify(process.env.VITE_CLOUDINARY_CLOUD_NAME),
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
  },
});
