import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import { initTheme } from './utils/theme'

// Thème appliqué avant le premier affichage (pas de clignotement)
initTheme()

const root = document.getElementById('app')
if (!root) {
  throw new Error('L’élément #app est introuvable dans le DOM.')
}

function afficher(msg) {
  const target = document.getElementById('app')
  if (!target) return

  const panel = target.querySelector('[data-fatal-error]')
  if (panel) panel.remove()

  const pre = document.createElement('pre')
  pre.setAttribute('data-fatal-error', 'true')
  pre.style.whiteSpace = 'pre-wrap'
  pre.style.padding = '16px'
  pre.style.color = '#b91c1c'
  pre.style.font = '14px monospace'
  pre.textContent = String(msg)
  target.innerHTML = ''
  target.appendChild(pre)
}

window.addEventListener('error', (e) => afficher(e.message))
window.addEventListener('unhandledrejection', (e) => afficher(String(e.reason?.stack || e.reason)))

let appInstallee = false

async function demarrer() {
  if (appInstallee) return
  appInstallee = true

  const { default: App } = await import('./App.vue')
  const { default: router } = await import('./router')
  const app = createApp(App)
  app.config.errorHandler = (err) => afficher(String(err.stack || err))
  app.use(createPinia()).use(router)
  app.mount(root)
}
demarrer().catch((e) => afficher(String(e.stack || e)))
