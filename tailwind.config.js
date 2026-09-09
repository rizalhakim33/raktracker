/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#256B8C",
        "primary-dark": "#174A61",
        "primary-light": "#E8F3F7",
        background: "#F8FAFB",
        surface: "#FFFFFF",
        "text-main": "#17232B",
        "text-secondary": "#60717A",
        border: "#D9E2E7",
        success: "#2E8B70",
        warning: "#D99A24",
        danger: "#D9534F",
        brand: { 50: '#E8F3F7', 100: '#D6EBF0', 500: '#256B8C', 600: '#174A61', 700: '#0F3A4D' },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(23,35,43,0.08), 0 8px 24px rgba(23,35,43,0.06)',
        card: '0 1px 2px rgba(23,35,43,0.06)',
      }
    },
  },
  plugins: [],
}
