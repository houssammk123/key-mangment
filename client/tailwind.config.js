/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#F5C842',
          500: '#D4A017',
          600: '#B8860B',
          700: '#9A6F00',
        },
      },
    },
  },
  plugins: [],
}

