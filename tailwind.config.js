import { nextui } from '@nextui-org/theme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@nextui-org/theme/dist/components/(button|ripple|spinner).js',
    ],
    theme: {
        extend: {
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                mona: ['Mona Sans', 'sans-serif'],
                ibm: ['IBM Plex Sans', 'sans-serif'],
            },
        },
    },
    darkMode: 'class',
    plugins: [nextui()],
};
