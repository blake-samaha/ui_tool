import type { Config } from 'tailwindcss';

export default {
    content: [
        './index.html',
        './src/**/*.{ts,tsx,html}',
        // Include shared packages so their utility classes are not purged
        '../ui-components/src/**/*.{ts,tsx}',
        '../form-renderer/src/**/*.{ts,tsx}'
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
