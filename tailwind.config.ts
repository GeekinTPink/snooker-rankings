import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'snooker-green': '#0a4d2e',
        'snooker-red': '#c41e3a',
        'snooker-gold': '#d4af37',
      },
    },
  },
  plugins: [],
}

export default config
