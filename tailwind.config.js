/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F8FC",
        primary: {
          DEFAULT: "#5856E9",
          hover: "#4845D9",
          light: "#EEEDFD",
        },
        navy: {
          DEFAULT: "#182230",
          light: "#334155",
        },
        facebook: {
          DEFAULT: "#1877F2",
          light: "#E7F3FF",
        },
        instagram: {
          DEFAULT: "#E1306C",
          light: "#FDF2F5",
        },
        youtube: {
          DEFAULT: "#FF0033",
          light: "#FFEAEF",
        },
        success: {
          DEFAULT: "#16A34A",
          light: "#DCFCE7",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
        },
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(24, 34, 48, 0.05)',
        'card-hover': '0 10px 25px -4px rgba(24, 34, 48, 0.09)',
        'primary': '0 4px 14px 0 rgba(88, 86, 233, 0.35)',
      }
    },
  },
  plugins: [],
}
