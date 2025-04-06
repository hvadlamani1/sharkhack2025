/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50',
        secondary: '#FFA000',
        accent: '#2196F3'
      }
    },
  },
  plugins: [],
}
