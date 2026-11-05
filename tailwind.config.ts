import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary, #0f172a)",
          hover: "var(--color-primary-hover, #1e293b)",
          foreground: "var(--color-primary-fg, #ffffff)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary, #f59e0b)",
          hover: "var(--color-secondary-hover, #d97706)",
          foreground: "var(--color-secondary-fg, #ffffff)",
        },
        site: {
          bg: "var(--color-bg, #ffffff)",
          text: "var(--color-text, #0f172a)",
          muted: "var(--color-muted, #64748b)",
          card: "var(--color-card, #ffffff)",
          border: "var(--color-border, #e2e8f0)",
        },
      },
      borderRadius: {
        button: "var(--btn-radius, 0.5rem)",
      },
    },
  },
  plugins: [],
};

export default config;

