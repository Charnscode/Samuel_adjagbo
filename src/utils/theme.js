// Thème clair / sombre. Choix mémorisé dans le navigateur. Clair par défaut.
import { ref } from 'vue'

const CLE = 'theme'
export const estSombre = ref(false)

export function appliquerTheme(sombre) {
  estSombre.value = sombre
  document.documentElement.classList.toggle('dark', sombre)
  try {
    localStorage.setItem(CLE, sombre ? 'sombre' : 'clair')
  } catch (e) {
    // Stockage indisponible : le thème reste actif pour la session.
  }
}

export function initTheme() {
  let sombre = false
  try {
    sombre = localStorage.getItem(CLE) === 'sombre'
  } catch (e) {
    sombre = false
  }
  appliquerTheme(sombre)
}

export function basculerTheme() {
  appliquerTheme(!estSombre.value)
}
