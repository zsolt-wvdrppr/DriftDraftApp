import type { Config } from "tailwindcss";
const colors = ("tailwindcss/colors");
const { default: flattenColorPalette } = require("tailwindcss/lib/util/flattenColorPalette");
import { heroui } from "@heroui/react";

// Define the addVariablesForColors plugin
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
/** @type {import('tailwindcss').Config} */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "tech-bg": "url('/tech-bg.svg')",
      },
      colors: {
        primary: '#05668D',
        secondary: '#028090',
        secondaryTeal: '#028090',
        secondaryPersianGreen: '#00A896',
        accent: '#02C39A',
        accentMint: '#02C39A',
        accentRed: '#E83151',
        neutralDark: '#2E0219',
        neutralCream: '#F0F3BD',
        neutral: '#FFFCFF',
        neutralSnow: '#FFFCFF',
        navbarColor: 'rgba(254,254,254,0.8)',
        neutralGray: '#C9C5CB',
        default: {
          100: '#fffcff',
        }
      },
      screens: {
        'mobile2': '414px',
        'mobile3': '468px',
        'mobile4': '512px',
      },
      boxShadow: {
        'input': `0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)`,
      }
    },
  },
  plugins: [
    heroui({
      themes: {
        dark: {
          colors: {
            default: {
              foreground: "#ffffff", // Replace with your color
            },
            foreground: "#ffffff", // Replace with your color
          },
        },
      },
    }),
    require("@tailwindcss/typography"),
  ],
};
export default config;
