// tailwind.config.js:path/to/file
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#141414',
          border: '#2a2a2a',
          hover: '#2a2a2a',
          active: '#2d2d2d'
        }
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(145deg, rgba(20, 20, 20, 0.95) 0%, rgba(26, 26, 26, 0.85) 100%)'
      }
    }
  },
  plugins: [],
  
}