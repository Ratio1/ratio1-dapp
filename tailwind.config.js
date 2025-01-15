import { nextui } from '@nextui-org/theme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@nextui-org/theme/dist/components/(alert|breadcrumbs|button|card|divider|drawer|dropdown|input|progress|select|toggle|tabs|ripple|spinner|modal|menu|popover|form|listbox|scroll-shadow).js',
    ],
    theme: {
        extend: {
            fontFamily: {
                mona: ['Mona Sans', 'sans-serif'],
                robotoMono: ['Roboto Mono', 'serif'],
            },
            flex: {
                2: '2 1 0%',
                3: '3 1 0%',
                4: '4 1 0%',
            },
            colors: {
                body: '#0b0b47',
                light: '#fcfcfd',
                lightAccent: '#F4F5FA',
                primary: '#1b47f7',
            },
            boxShadow: {
                'sm-light': '0px 3px 4px 0px #00000008',
            },
            rotate: {
                270: '270deg',
            },
            brightness: {
                1000: '100.0',
            },
        },
    },
    darkMode: 'class',
    plugins: [nextui()],
};
