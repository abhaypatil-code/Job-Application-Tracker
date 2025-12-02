/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B1120', // Darker, richer background
        surface: '#1E293B', // Slate 800
        primary: '#6366F1', // Indigo 500 (Vibrant)
        secondary: '#A855F7', // Purple 500 (Vibrant)
        success: '#10B981', // Emerald 500
        warning: '#F59E0B', // Amber 500
        error: '#EF4444', // Red 500
        text: {
          primary: '#F8FAFC', // Slate 50
          secondary: '#94A3B8', // Slate 400
          muted: '#64748B', // Slate 500
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
