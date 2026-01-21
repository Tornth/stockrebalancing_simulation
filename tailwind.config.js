/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0f172a',
        'brand-light': '#ffffff',
        'brand-card': '#ffffff',
        'brand-blue': '#0088FF',
        'brand-text': '#1f2937',
        'brand-text-secondary': '#6b7280',
        'drift-alert': '#f43f5e',
        'sync-pulse': '#10b981',
        'ghost-blue': '#60a5fa'
      },
      fontFamily: {
        'thai': ['"Noto Sans Thai"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
