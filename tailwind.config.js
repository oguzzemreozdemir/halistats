/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        field: {
          bg: '#07100B',
          bg2: '#08110C',
          card: '#101A14',
          cardhi: '#16241C',
          border: '#1E3026',
          line: '#24382C',
        },
        grass: {
          DEFAULT: '#22C55E',
          soft: '#16A34A',
          dim: '#0F8C44',
        },
        emerald2: '#34D399',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Archivo"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 30px -12px rgba(0,0,0,0.6)',
        // Crisp green edge instead of a blurred glow — the blurred glow smeared
        // (ghosted) on iOS Safari during scroll/animation. Ring only, no blur.
        glow: '0 0 0 1px rgba(34,197,94,0.35)',
        soft: '0 2px 14px -6px rgba(0,0,0,0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '60%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'pop': 'pop 0.3s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
}
