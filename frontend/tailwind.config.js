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
          950: '#080d1a',
          900: '#0e1526',
          850: '#131c33',
          800: '#1a2542',
          750: '#212f52',
          700: '#2b3b64',
          600: '#3d5084',
        },
        slate: {
          850: '#141d2e',
          900: '#0f172a',
          950: '#020617',
        },
        accent: {
          teal: '#0284c7', // Professional sky blue instead of blinding neon
          cyan: '#38bdf8', // Clean sky
          green: '#10b981', // Natural emerald
          emerald: '#059669',
          amber: '#f59e0b', // Balanced trading amber
          orange: '#ea580c',
          rose: '#e11d48',
          blue: '#2563eb',
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
