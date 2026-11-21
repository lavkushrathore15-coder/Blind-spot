import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(__dirname, 'index.html').replace(/\\/g, '/'),
    path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx}').replace(/\\/g, '/'),
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./frontend/index.html",
    "./frontend/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#f8fafc', // Canvas background (slate-50)
          900: 'rgba(255, 255, 255, 0.85)', // Frosted card background
          850: 'rgba(248, 250, 252, 0.9)', // Frosted inner container
          800: '#e2e8f0', // Clean border / divider (slate-200)
          750: '#cbd5e1', // Slate-300 subtle border
          700: '#94a3b8', // Slate-400
          600: '#64748b', // Slate-500
        },
        cyan: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.25)',
        'glow-cyan-sm': '0 0 15px -3px rgba(6, 182, 212, 0.18)',
        'glow-violet': '0 0 25px -5px rgba(124, 58, 237, 0.18)',
        'glass': '0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
        'glass-light': '0 8px 24px -4px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'sweep 4s linear infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
