/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: '#A6FF00',
          base: '#A6FF00',
          dark: '#8DE600',
          light: '#BAFF33',
        },
        pixel: {
          bg: '#A6FF00',
          black: '#000000',
          white: '#FFFFFF',
          gray: '#CCCCCC',
          darkgray: '#222222',
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace', 'cursive'],
        silkscreen: ['"Silkscreen"', '"Press Start 2P"', 'monospace'],
        mono: ['"Space Mono"', 'monospace'],
        vt: ['"VT323"', 'monospace'],
      },
      boxShadow: {
        'pixel-sm': '2px 2px 0px #000000',
        'pixel': '4px 4px 0px #000000',
        'pixel-lg': '6px 6px 0px #000000',
        'pixel-xl': '8px 8px 0px #000000',
        'pixel-white': '4px 4px 0px #FFFFFF',
        'pixel-pressed': '1px 1px 0px #000000',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '5': '5px',
      }
    },
  },
  plugins: [],
}
