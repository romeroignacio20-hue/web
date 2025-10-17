/** @type {import('tailwindcss').Config} */
module.exports = {
    theme: {
      extend: {
        colors: {
          "color-1": "hsl(var(--color-1))",
          "color-2": "hsl(var(--color-2))",
          "color-3": "hsl(var(--color-3))",
          "color-4": "hsl(var(--color-4))",
          "color-5": "hsl(var(--color-5))",
        },
        animation: {
          pulse: "pulse var(--duration, 1.5s) cubic-bezier(0.4, 0, 0.6, 1) infinite",
          rainbow: "rainbow var(--speed, 2s) infinite linear",
        },
        keyframes: {
          pulse: {
            "0%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 var(--pulse-color)" },
            "70%": { transform: "scale(1)", boxShadow: "0 0 0 10px transparent" },
            "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 transparent" },
          },
          rainbow: {
            "0%": { "background-position": "0%" },
            "100%": { "background-position": "200%" },
          },
        },
      },
    },
  };