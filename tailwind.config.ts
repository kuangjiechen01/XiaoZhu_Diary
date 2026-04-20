import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        }
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem"
      },
      boxShadow: {
        soft: "0 18px 50px -24px rgba(74, 59, 46, 0.18)",
        card: "0 10px 30px -18px rgba(74, 59, 46, 0.14)"
      },
      fontFamily: {
        sans: [
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Source Han Sans SC"',
          '"Noto Sans CJK SC"',
          "system-ui",
          "sans-serif"
        ],
        serif: [
          '"Songti SC"',
          '"Noto Serif CJK SC"',
          '"STSong"',
          "serif"
        ]
      },
      backgroundImage: {
        "paper-glow":
          "radial-gradient(circle at top, rgba(223, 208, 185, 0.25), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,244,238,0.95))"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
