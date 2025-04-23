/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'avika-primary': '#4a6da7',
        'avika-secondary': '#ff9800',
        'avika-success': '#4caf50',
        'avika-danger': '#f44336',
        'avika-warning': '#ff9800',
        'avika-info': '#2196f3',
        'avika-light': '#f5f5f5',
        'avika-dark': '#333333',
      },
      fontFamily: {
        'sans': ['Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
