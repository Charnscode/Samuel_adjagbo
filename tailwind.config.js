/** Couleurs issues du prototype : bleu marine, bleu vif, or.
 *  Thème sombre activé par la classe « dark » sur <html>. */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#081635', 900: '#0B1F4B', 800: '#10296A', 700: '#1B3A85' },
        brand: { DEFAULT: '#1E6BFF', dark: '#1553CC', soft: '#E8F0FF' },
        gold: { DEFAULT: '#F5B83D', dark: '#D99A1E' },
        alerte: { noir: '#111827', orange: '#F59E0B', rouge: '#DC2626' }
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] }
    }
  },
  plugins: []
}
