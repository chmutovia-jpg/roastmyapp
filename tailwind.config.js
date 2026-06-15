/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 24px 70px rgba(24, 34, 48, 0.12)",
        roast: "0 30px 90px rgba(16, 20, 24, 0.16)",
        lime: "0 20px 54px rgba(180, 188, 188, 0.18)",
      },
    },
  },
  plugins: [],
};
