import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 5173,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@components': path.resolve(__dirname, './src/components'),
            '@lib': path.resolve(__dirname, './src/lib'),
            '@services': path.resolve(__dirname, './src/services'),
            '@assets': path.resolve(__dirname, './src/assets'),
            '@shared': path.resolve(__dirname, './src/shared'),
            '@blockchain': path.resolve(__dirname, './src/blockchain'),
        },
    },
});
