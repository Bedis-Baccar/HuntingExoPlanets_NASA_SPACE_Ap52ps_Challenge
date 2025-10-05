/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        space: { bg: '#252627', primary: '#b83c2c', text: '#fcecce' },
        accent: {
          clay: '#a7754e',
            sand: '#c99665',
            umber: '#80563e'
        }
      },
      fontFamily: {
        heading: ['-apple-system','BlinkMacSystemFont','"Segoe UI"','Roboto','Oxygen','Ubuntu','Cantarell','"Noto Sans"','"Helvetica Neue"','Arial','sans-serif','"Apple Color Emoji"','"Segoe UI Emoji"','"Segoe UI Symbol"'],
        body: ['-apple-system','BlinkMacSystemFont','"Segoe UI"','Roboto','Oxygen','Ubuntu','Cantarell','"Noto Sans"','"Helvetica Neue"','Arial','sans-serif','"Apple Color Emoji"','"Segoe UI Emoji"','"Segoe UI Symbol"']
      }
    }
  },
  plugins: []
}
