/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        bean: {
          50: '#fdf8f0',
          100: '#f5e6d3',
          200: '#e8cba7',
          300: '#d4a574',
          400: '#c4844a',
          500: '#a0642c',
          600: '#7d4e22',
          700: '#5c3a1a',
          800: '#3d2712',
          900: '#1f140a',
        },
      },
    },
  },
  plugins: [],
}
