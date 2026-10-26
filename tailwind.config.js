/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ios: {
          bg: '#f8f9fa',
          darkBg: '#000000',
          card: 'rgba(255, 255, 255, 0.75)',
          darkCard: 'rgba(24, 24, 27, 0.70)',
          border: 'rgba(0, 0, 0, 0.08)',
          darkBorder: 'rgba(255, 255, 255, 0.10)',
          primary: '#000000',
          darkPrimary: '#ffffff',
          accent: '#e11d48',
          subtext: '#71717a',
          darkSubtext: '#a1a1aa',
        },
      },
      backdropBlur: {
        '2xl': '40px',
        '3xl': '64px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'ios': '1.25rem',
      },
      boxShadow: {
        'ios': '0 4px 24px -1px rgba(0, 0, 0, 0.06), 0 2px 8px -2px rgba(0, 0, 0, 0.04)',
        'ios-dark': '0 4px 24px -1px rgba(0, 0, 0, 0.5), 0 2px 8px -2px rgba(0, 0, 0, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
};
