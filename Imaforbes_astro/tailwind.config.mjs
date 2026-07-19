// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default { // Importante: 'export default' para Vite
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {},
  },
  plugins: [],
}


