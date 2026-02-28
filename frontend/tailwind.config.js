/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
        orbitron: ['Orbitron', 'monospace'],
      },
      colors: {
        green: {
          DEFAULT: '#00ff41',
          dim: '#00b32c',
          700: '#1a7a2e',
          800: '#0d4a1a',
          900: '#062b10',
        },
        cyan: {
          DEFAULT: '#00e5ff',
          dim: '#0097a7',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
