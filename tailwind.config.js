import { nextui } from '@nextui-org/theme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@nextui-org/theme/dist/components/(alert|button|divider|drawer|dropdown|input|modal|progress|select|spinner|toggle|tabs|ripple|menu|popover|form|listbox|scroll-shadow|skeleton|pagination|spacer|table).js',
    ],
    theme: {
        extend: {
            fontFamily: {
                mona: ['Mona Sans', 'sans-serif'],
                robotoMono: ['Roboto Mono', 'serif'],
            },
            flex: {
                0: '0',
                2: '2 1 0%',
                3: '3 1 0%',
                4: '4 1 0%',
            },
            colors: {
                body: '#0b0b47',
                light: '#fcfcfd',
                lightBlue: '#F4F5FA',
                primary: '#1b47f7',
            },
            outlineWidth: {
                3: '3px',
                6: '6px',
            },
        },
        screens: {
            xs: '400px',
            sm: '480px',
            md: '768px',
            layoutBreak: '836px',
            lg: '1024px',
            larger: '1232px',
            xl: '1410px',
            '2xl': '1536px',
        },
    },

    darkMode: 'class',
    plugins: [nextui()],
};
