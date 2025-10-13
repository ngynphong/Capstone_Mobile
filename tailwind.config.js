/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        backgroundColor: '#3CBCB2', // Blue color for primary buttons and headers
        brightColor: '#3B82F6', // Blue color for links and accents
      },
    },
  },
  plugins: [],
};
