/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{jsx,js}'
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          dark: '#0d1f17',
          mid: '#1a3a2a',
          light: '#2d5a40'
        },
        leaf: {
          green: '#4ade80',
          dark: '#16a34a',
          light: '#86efac'
        },
        bark: {
          brown: '#92400e',
          light: '#d97706'
        }
      }
    }
  },
  plugins: []
}
