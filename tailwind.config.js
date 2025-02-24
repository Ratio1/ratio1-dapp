import { nextui } from '@nextui-org/theme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@nextui-org/theme/dist/components/(alert|button|divider|drawer|dropdown|form|input|modal|pagination|select|skeleton|spinner|toggle|table|tabs|ripple|menu|popover|listbox|scroll-shadow|checkbox|spacer).js',
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
                primary: '#1b47f7',
            },
            outlineWidth: {
                3: '3px',
                6: '6px',
            },
            boxShadow: {
                round: '0 0px 2px 0 rgb(0 0 0 / 0.05)',
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
