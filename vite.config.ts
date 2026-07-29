import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const backendProxyTarget = env.BACKEND_PROXY_TARGET;
    const useHttps = env.DEV_HTTPS !== 'false';

    return {
        server: {
            host: '0.0.0.0',
            port: 3000,
            hmr: {
                overlay: true, // Shows errors without reloading the page
            },
            proxy: backendProxyTarget
                ? {
                      '/api': {
                          target: backendProxyTarget,
                          changeOrigin: true,
                          rewrite: (path) => path.replace(/^\/api/, ''),
                      },
                  }
                : undefined,
        },
        plugins: [react(), ...(useHttps ? [basicSsl()] : []), tailwindcss()],
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
                '@schemas': path.resolve(__dirname, './src/schemas'),
                '@data': path.resolve(__dirname, './src/data'),
            },
        },
    };
});
