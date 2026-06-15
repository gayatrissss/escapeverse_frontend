/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#f0f4ff', 100: '#dbe4ff', 200: '#bac8ff', 300: '#91a7ff', 400: '#748ffc', 500: '#5c7cfa', 600: '#4c6ef5', 700: '#4263eb', 800: '#3b5bdb', 900: '#364fc7' },
        neon: { cyan: '#00fff5', magenta: '#ff00ff', green: '#39ff14', yellow: '#fff01f', orange: '#ff6600', red: '#ff073a' },
        dark: { 50: '#c1c2c5', 100: '#a6a7ab', 200: '#909296', 300: '#5c5f66', 400: '#373a40', 500: '#2c2e33', 600: '#25262b', 700: '#1a1b1e', 800: '#141517', 900: '#101113' }
      },
      fontFamily: { display: ['Orbitron', 'sans-serif'], body: ['Inter', 'sans-serif'] },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out'
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
        glow: { '0%': { boxShadow: '0 0 5px #00fff5, 0 0 10px #00fff5' }, '100%': { boxShadow: '0 0 20px #00fff5, 0 0 40px #00fff5' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
      },
      backdropBlur: { xs: '2px' }
    }
  },
  plugins: []
};
