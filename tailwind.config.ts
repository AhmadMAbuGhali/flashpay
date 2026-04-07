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
          cyan: "#00D2FF",      // لون البرق
          silver: "#E2E8F0",    // فضي فاتح للنصوص
          brand: "#6a7eaa",    // الدرجة اللي اخترتها (الخلفية)
          darker: "#4a5b81",   // درجة أغمق قليلاً للظلال والحدود
        }
      },
      // أضفنا أنيميشن بسيط للظهور
      animation: {
        'fade-up': 'fade-up 0.8s ease-out forwards',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;