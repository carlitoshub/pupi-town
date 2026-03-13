/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        pokemon: {
          yellow: '#FFE040',
          dark: '#0f0f1a',
          blue: '#2980E8',
          red: '#E85030',
          green: '#48B858',
        },
      },
    },
  },
  plugins: [],
};
