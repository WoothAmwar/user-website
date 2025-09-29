/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          body: "var(--color-body)",
          surface: "var(--color-surface)",
          surfaceMuted: "var(--color-surface-muted)",
          elevated: "var(--color-elevated)",
          border: "var(--color-border)",
          input: "var(--color-input)",
          primary: "var(--color-primary)",
          primaryHover: "var(--color-primary-hover)",
          text: "var(--color-text)",
          subtle: "var(--color-subtle)",
          muted: "var(--color-muted)",
          tagText: "var(--color-tag-text)",
          danger: "var(--color-danger)",
          success: "var(--color-success)",
        },
      },
      boxShadow: {
        focus: "0 0 0 2px rgba(59, 130, 246, 0.35)",
        surface: "0 18px 30px rgba(15, 23, 42, 0.35)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};
