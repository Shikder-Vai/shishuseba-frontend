/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./*.{js,ts,jsx,tsx,mdx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      animation: { 
        marquee: "marquee 20s linear infinite",
        "fade-in": "fadeIn 300ms ease-in"
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        }
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        // ... other HSL definitions ...

        brand: {
          teal: {
            base: "#018b76",
            50: "#b5dcd6",
            100: "#259e8b",
            200: "#08917c",
            300: "#018e79",
            400: "#179784",
            500: "#015d4f"
          },
          orange: {
            base: "#ffa245",
            light: "#ffd8b5"
          },
          cream: "#feefe0",
          gray: {
            base: "#6c6c6c",
            light: "#f3f3f3"
          }
        }
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(1, 139, 118, 0.1)',
        'soft-orange': '0 2px 8px rgba(255, 162, 69, 0.1)'
      },
      backgroundImage: {
        'teal-gradient': 'linear-gradient(135deg, #018b76 0%, #259e8b 100%)',
        'cream-gradient': 'linear-gradient(to bottom, #feefe0 0%, #ffffff 100%)'
      }
    }
  },
  plugins: [daisyui],
  daisyui: {
    themes: [{
      light: {
        "primary": "#018b76",
        "secondary": "#ffa245",
        "accent": "#179784",
        "neutral": "#6c6c6c",
        "base-100": "#ffffff",
        "info": "#b5dcd6",
        "success": "#018e79",
        "warning": "#ffa245",
        "error": "#e11d48",
      }
    }],
    darkTheme: "light",
  },
};