/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cu: {
          cyan: '#b2ebf2',
          lightCyan: '#e0f7fa',
          cardCyan: '#99e7f4',
          accentPink: '#ff4b6e',
          pillPink: '#ffebee',
          pillActive: '#ffdbe2',
          navy: '#0f172a',
        }
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
};
