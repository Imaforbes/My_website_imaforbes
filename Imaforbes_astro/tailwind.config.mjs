/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"SF Pro Text"', '"SF Pro Icons"', '-apple-system', 'BlinkMacSystemFont', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['"SF Pro Display"', '"SF Pro Icons"', '-apple-system', 'BlinkMacSystemFont', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"SF Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        serif: ['ui-serif', '"New York"', '-apple-system-ui-serif', '"Iowan Old Style"', 'Georgia', 'serif'],
      },
      colors: {
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
      },
      borderColor: {
        DEFAULT: 'var(--color-border)',
        strong: 'var(--color-border-strong)',
      },
    },
  },
  plugins: [],
}
