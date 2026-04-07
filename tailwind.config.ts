import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        flash: {
          cyan: "#00D2FF",    // لون البرق الأزرق من شعارك
          silver: "#A8B2BD",  // لون الفضة المعدني
          dark: "#687287",    // لون الخلفية الداكنة في الصورة
        }
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-up': 'fade-up 0.8s ease-out forwards',
      }
    },
  },
  plugins: [],
};
export default config;