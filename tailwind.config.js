import { nextui } from '@nextui-org/theme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@nextui-org/theme/dist/components/(breadcrumbs|button|card|divider|drawer|input|progress|select|ripple|spinner|modal|form|listbox|popover|scroll-shadow).js',
    ],
    theme: {
        extend: {
            fontFamily: {
                mona: ['Mona Sans', 'sans-serif'],
            },
            flex: {
                2: '2 1 0%',
                3: '3 1 0%',
                4: '4 1 0%',
            },
            colors: {
                body: '#0b0b47', //'#2e3038',
                bodyLight: '#73798c',
                bodyHover: '#9ba1ae',
                darkAccent: '#283044',
                whitesmoke: '#f5f5f5',
                lightAccent: '#F4F5FA',
                primary: '#1b47f7',
                light: '#fcfcfd',
                softGray: '#f6f6f8',
            },
            boxShadow: {
                'sm-light': '0px 3px 4px 0px #00000008',
            },
            rotate: {
                270: '270deg',
            },
        },
    },
    darkMode: 'class',
    plugins: [nextui()],
};
