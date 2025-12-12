/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 1. Purple (Primary Brand Color) - Used for Buttons, Headers, Active States
        primary: {
          DEFAULT: '#6D28D9', // Vibrant Purple
          hover: '#5B21B6',   // Darker purple for hover effects
          light: '#DDD6FE',   // Light purple background
        },
        // 2. Golden Yellow (Secondary/Accent) - Used for Highlights, Badges, Call-to-Actions
        secondary: {
          DEFAULT: '#F59E0B', // Golden Yellow (Amber-500)
          hover: '#D97706',   
        },
        // 3. Blue (Trust/Info) - Used for Links, Info Cards
        accent: {
          DEFAULT: '#2563EB', // Standard Blue
          dark: '#1E40AF',
        },
        // 4. Off-White (Backgrounds) - Easier on the eyes than pure white
        offwhite: '#F9FAFB', 
      }
    },
  },
  plugins: [],
}