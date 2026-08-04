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
        primary: '#22c55e',
        background: {
          light: '#f8fafc',
          dark: '#0f172a',
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
