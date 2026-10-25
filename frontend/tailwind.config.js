/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070d19',
          900: '#0b132b',
          850: '#111c3a',
          800: '#1c2541',
          700: '#273458',
          600: '#3a4b7c',
        },
        slate: {
          850: '#151f30',
          900: '#0f172a',
          950: '#020617',
        },
        accent: {
          teal: '#06b6d4',
          cyan: '#22d3ee',
          green: '#10b981',
          emerald: '#34d399',
          amber: '#f59e0b',
          orange: '#f97316',
          rose: '#f43f5e',
          blue: '#3b82f6',
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
