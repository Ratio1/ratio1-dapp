import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vite.dev/config/
export default defineConfig({
    server: { port: 3000 },
    plugins: [react(), basicSsl()],
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
