import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        acai: {
          50: '#fef7ff',
          100: '#f9ecff',
          200: '#f0d0ff',
          300: '#e2a5ff',
          400: '#d073ff',
          500: '#b83bff',
          600: '#9a1edb',
          700: '#7c13b0',
          800: '#610f8a',
          900: '#4f0f6f',
        },
        guarana: '#8A1538',
        tapioca: '#F2E9E4',
      },
    },
  },
  plugins: [],
} satisfies Config;
