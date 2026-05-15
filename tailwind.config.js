/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // OCV Brand — extraídos de torreonconquista.com/wp-content/themes/ocv/style.css
        ocv: {
          cyan:    '#00aad1',
          'cyan-bright': '#00bce5',
          yellow:  '#ffdc00',
          magenta: '#ff0294',
          green:   '#3da92b',
          red:     '#ff2014',
        },
        // Cyber-Industrial dark palette
        surface: {
          950: '#0d1117',
          900: '#171e23',
          800: '#1e262d',
          700: '#262b30',
          600: '#313a42',
          500: '#3d4850',
        },
        // Neutral
        ink: {
          400: '#a1b0b6',
          300: '#c4cdd2',
          200: '#dce3e7',
          100: '#efefef',
        },
      },
      fontFamily: {
        display: ['"big-noodle"', 'Impact', 'ui-sans-serif'],
        body:    ['"aller"', 'Inter', 'ui-sans-serif'],
      },
      boxShadow: {
        'glow-cyan':    '0 0 12px 2px rgba(0,172,209,0.55)',
        'glow-yellow':  '0 0 12px 2px rgba(255,220,0,0.45)',
        'glow-magenta': '0 0 12px 2px rgba(255,2,148,0.45)',
      },
      backgroundImage: {
        'cyber-grid': "linear-gradient(rgba(0,172,209,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,172,209,.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        'cyber-grid': '40px 40px',
      },
    },
  },
  plugins: [],
}
