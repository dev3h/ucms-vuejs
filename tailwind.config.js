import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Figtree", ...defaultTheme.fontFamily.sans],
        secondary: ["Meiryo", "sans-serif"],
        primary: ["Roboto", "sans-serif"],
      },
      colors: {
        primary: "#002147",
        black54: "#545454",
      }
    },
  },
  plugins: [forms, typography],
}

