import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
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
          "sans-serif"
        ]
      },
      colors: {
        ink: "#111827",
        muted: "#667085",
        line: "#d9e2e7",
        gain: "#0f7a4f",
        loss: "#b42318"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(16, 24, 40, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
