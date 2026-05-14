/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ink-base': '#050816',
        'ink-deep': '#0b1020',
        primary: '#7c3aed',
        secondary: '#22d3ee',
        accent: '#f59e0b',
        highlight: '#ec4899'
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sora: ['Sora', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      }
    }
  },
  plugins: []
};
