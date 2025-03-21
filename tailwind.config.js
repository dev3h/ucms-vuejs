import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', ...defaultTheme.fontFamily.sans],
        secondary: ['Meiryo', 'sans-serif'],
        primary: ['Roboto', 'sans-serif']
      },
      colors: {
        primary: '#002147',
        black54: '#545454',
        grayF5: '#f5f5f5',
        grayF0: '#f0f0f0',
        redD1: '#D12030'
      }
    }
  },
  plugins: [forms, typography]
}

