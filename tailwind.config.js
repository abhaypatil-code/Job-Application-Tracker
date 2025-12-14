/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#000000', // Pure black
        surface: '#0a0a0a', // Near black for cards
        'surface-light': '#141414', // Slightly lighter for hover states
        primary: '#818cf8', // Indigo 400 (Vibrant)
        secondary: '#c084fc', // Purple 400 (Vibrant)
        accent: {
          cyan: '#22d3ee', // Cyan 400
          violet: '#a78bfa', // Violet 400
          rose: '#fb7185', // Rose 400
        },
        success: '#34d399', // Emerald 400
        warning: '#fbbf24', // Amber 400
        error: '#f87171', // Red 400
        text: {
          primary: '#ffffff', // Pure white
          secondary: '#a1a1aa', // Zinc 400
          muted: '#71717a', // Zinc 500
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 10px -3px rgba(129, 140, 248, 0.3)',
        'glow': '0 0 20px -5px rgba(129, 140, 248, 0.4)',
        'glow-lg': '0 0 30px -5px rgba(129, 140, 248, 0.5)',
        'glow-cyan': '0 0 20px -5px rgba(34, 211, 238, 0.4)',
        'glow-violet': '0 0 20px -5px rgba(167, 139, 250, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
