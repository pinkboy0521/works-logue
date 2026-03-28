import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    'frontend/src/**/*.{ts,tsx}',
    'frontend/src/app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        surface: 'hsl(var(--surface))',
        'surface-raised': 'hsl(var(--surface-raised))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        growth: 'hsl(var(--growth))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        ring: 'hsl(var(--ring))',
        input: 'hsl(var(--input))',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      spacing: {
        content: '720px',
        wide: '1080px',
        'full-wide': '1280px',
      },
      maxWidth: {
        content: '720px',
        wide: '1080px',
        'full-wide': '1280px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        // 種が「呼吸」する
        'seed-breathe': {
          '0%, 100%': { transform: 'scale(1.0)' },
          '50%': { transform: 'scale(1.04)' },
        },
        // 芽が上方向に伸びる
        'sprout-grow': {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
        },
        // 開花の爆発
        'bloom-burst': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1.0)', opacity: '1' },
        },
        // 開花後の発光パルス
        'bloom-glow': {
          '0%, 100%': {
            filter: 'drop-shadow(0 0 4px hsl(var(--accent) / 0.3))',
          },
          '50%': {
            filter: 'drop-shadow(0 0 12px hsl(var(--accent) / 0.7)) drop-shadow(0 0 24px hsl(var(--accent) / 0.4))',
          },
        },
        // カードのstagger reveal
        'fade-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        // 水面の波紋
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        // 数値カウントアップ用
        'count-up': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'seed-breathe': 'seed-breathe 3s ease-in-out infinite',
        'sprout-grow': 'sprout-grow 0.6s ease-out forwards',
        'bloom-burst': 'bloom-burst 0.8s ease-out forwards',
        'bloom-glow': 'bloom-glow 2s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s ease-out forwards',
        ripple: 'ripple 0.8s ease-out forwards',
        'count-up': 'count-up 0.3s ease-out forwards',
      },
      boxShadow: {
        seed: '0 0 0 1px hsl(var(--border)), 0 2px 8px rgba(0,0,0,0.4)',
        'card-hover': '0 0 0 1px hsl(var(--border)), 0 8px 32px rgba(0,0,0,0.5)',
        bloom: '0 0 24px 4px hsl(var(--accent) / 0.4), 0 0 8px 2px hsl(var(--accent) / 0.6)',
        'growth-glow': '0 0 16px 2px hsl(var(--growth) / 0.3)',
      },
      backgroundImage: {
        // SVGノイズテクスチャ（微細なグレイン）
        noise:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
        // ボタニカルグリッドパターン
        'botanical-grid':
          'radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
}

export default config
