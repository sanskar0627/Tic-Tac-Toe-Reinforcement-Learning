import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        cream: "#FFF4D6",
        blush: "#FFE0EF",
        hotpink: {
          DEFAULT: "#FF2E93",
          deep: "#E01074",
        },
        lime: {
          DEFAULT: "#C8FF3D",
          deep: "#8FDE00",
        },
        cyan: {
          DEFAULT: "#20E3FF",
          deep: "#00B8D4",
        },
        sun: {
          DEFAULT: "#FFE500",
          deep: "#F5C400",
        },
        clay: {
          rose: "#FF8AB5",
          mint: "#9CFFB0",
          ice: "#9AF0FF",
          sand: "#FFE9A8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Archivo Black", "sans-serif"],
        sans: ["var(--font-body)", "Manrope", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "monospace"],
      },
      borderWidth: {
        3: "3px",
        4: "4px",
      },
      borderRadius: {
        clay: "20px",
        plump: "24px",
        pill: "999px",
      },
      boxShadow: {
        /**
         * Plush Brutalism: a sharpie-hard offset drop shadow
         * stacked with claymorphism inner light (top-left) and
         * inner shade (bottom-right). The element reads as a
         * puffy clay object traced with a fat marker.
         */
        plush: [
          "6px 6px 0 0 #111111",
          "inset 5px 5px 10px rgba(255,255,255,0.62)",
          "inset -5px -7px 12px rgba(17,17,17,0.16)",
        ].join(", "),
        "plush-sm": [
          "4px 4px 0 0 #111111",
          "inset 4px 4px 8px rgba(255,255,255,0.58)",
          "inset -4px -5px 9px rgba(17,17,17,0.15)",
        ].join(", "),
        "plush-lg": [
          "8px 8px 0 0 #111111",
          "inset 6px 6px 14px rgba(255,255,255,0.64)",
          "inset -6px -8px 16px rgba(17,17,17,0.18)",
        ].join(", "),
        "plush-press": [
          "0px 0px 0 0 #111111",
          "inset 3px 3px 8px rgba(255,255,255,0.28)",
          "inset -4px -5px 10px rgba(17,17,17,0.24)",
        ].join(", "),
        clay: [
          "inset 5px 5px 12px rgba(255,255,255,0.7)",
          "inset -5px -7px 14px rgba(17,17,17,0.16)",
        ].join(", "),
        "clay-deep": [
          "inset 3px 3px 8px rgba(255,255,255,0.35)",
          "inset -6px -8px 14px rgba(17,17,17,0.22)",
        ].join(", "),
        stamp: "4px 4px 0 0 #111111",
        "stamp-sm": "3px 3px 0 0 #111111",
      },
      dropShadow: {
        ink: "2px 2px 0 #111111",
      },
      backgroundImage: {
        "dot-grid":
          "radial-gradient(#111111 1.1px, transparent 1.1px)",
        scan:
          "repeating-linear-gradient(0deg, rgba(17,17,17,0.04) 0 1px, transparent 1px 4px)",
      },
      backgroundSize: {
        "dot-grid": "18px 18px",
      },
      keyframes: {
        squish: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.035, 0.97)" },
        },
        pulseRing: {
          "0%": { boxShadow: "6px 6px 0 0 #111111, 0 0 0 0 rgba(255,46,147,0.55)" },
          "70%": { boxShadow: "6px 6px 0 0 #111111, 0 0 0 12px rgba(255,46,147,0)" },
          "100%": { boxShadow: "6px 6px 0 0 #111111, 0 0 0 0 rgba(255,46,147,0)" },
        },
      },
      animation: {
        squish: "squish 1.6s ease-in-out infinite",
        "pulse-ring": "pulseRing 1.4s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
