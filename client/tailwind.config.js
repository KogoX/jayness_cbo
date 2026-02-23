/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        authFade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        authScaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
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
