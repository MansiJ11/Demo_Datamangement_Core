/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        btnAdd: '#0077b6',
        delete: '#c9184a',
      }
    },
  },
  plugins: [],
}