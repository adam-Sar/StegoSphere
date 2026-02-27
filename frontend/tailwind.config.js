/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'stegobg': '#11111B',
        'stegosurface': '#1E1E2E',
        'stegolight': '#313244',
        'stegotext': '#CDD6F4',
        'stegoaccent': '#cba6f7',
        'stegohover': '#b4befe',
      }
    },
  },
  plugins: [],
}
