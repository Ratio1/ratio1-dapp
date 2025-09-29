import { heroui } from '@heroui/theme';
import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@heroui/theme/dist/**/(alert|button|divider|drawer|dropdown|form|input|modal|pagination|select|skeleton|spinner|toggle|table|tabs|ripple|menu|popover|listbox|scroll-shadow|checkbox|spacer).js',
    ],
    theme: {
        extend: {},
    },

    darkMode: 'class',
    plugins: [heroui()],
};

export default config;
