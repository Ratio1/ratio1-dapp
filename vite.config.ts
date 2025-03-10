import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import path from 'path';
import { defineConfig } from 'vite';

const gitVersion = execSync('git describe --tags --abbrev=0').toString().trim();

// https://vite.dev/config/
export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 3000,
        hmr: {
            overlay: true, // Shows errors without reloading the page
        },
    },
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
            '@typedefs': path.resolve(__dirname, './src/typedefs'),
        },
    },
    define: {
        'import.meta.env.VITE_APP_VERSION': JSON.stringify(gitVersion),
    },
});
