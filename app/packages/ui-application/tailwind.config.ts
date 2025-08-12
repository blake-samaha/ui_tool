import type { Config } from 'tailwindcss';

export default {
    content: [
        './index.html',
        './src/**/*.{ts,tsx,html}'
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Inter', 'Helvetica Neue', 'Arial', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji']
            }
        }
    },
    plugins: []
} satisfies Config;
