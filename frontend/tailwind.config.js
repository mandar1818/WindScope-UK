/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          bg: '#F5F7F2',
          surface: '#FFFFFF',
          forest: '#245B45',
          'forest-hover': '#1B4736',
          'forest-light': '#EBF2EE',
          sage: '#8FAE91',
          'sage-light': '#F2F6F3',
          'sage-dark': '#5D7C60',
          text: '#26332C',
          muted: '#748078',
          subtle: '#9EAAA2',
          actual: '#26966B',
          forecast: '#5689B5',
          risk: '#D49A42',
          'risk-light': '#FDF6EB',
          border: '#E1E8DF',
          'border-light': '#EDF2EC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
