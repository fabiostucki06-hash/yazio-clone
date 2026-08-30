/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#10b981',
        background: {
          light: '#F4F6F8',
          dark: '#020617',
        },
        macro: {
          carbs: '#3b82f6',
          protein: '#ef4444',
          fat: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
};
