/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mcdu: {
          bg: '#0a0a0a',      // Deep black for the screen background
          text: '#00ff00',    // Classic aviation green for data
          title: '#ffffff',   // White for headers
          alert: '#ff9900',   // Amber for warnings
        }
      }
    },
  },
  plugins: [],
}