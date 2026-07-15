import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'matte-base': '#1a1a19',
        'matte-panel': '#262626',
        'amber-glow': '#ffb000',
        'crimson-alert': '#cc0000',
      },
      fontFamily: {
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'JetBrains Mono',
          'Menlo',
          'Consolas',
          'Courier New',
          'monospace',
        ],
      },
      boxShadow: {
        'hardware-out': '4px 4px 10px rgba(0,0,0,0.8), -2px -2px 5px rgba(255,255,255,0.05)',
        'hardware-in': 'inset 4px 4px 10px rgba(0,0,0,0.9), inset -2px -2px 5px rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
