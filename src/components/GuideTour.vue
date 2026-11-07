<template>
  <button v-if="bouton" type="button" class="gd-aide" aria-label="Revoir le guide" title="Revoir le guide" @click="ouvrir">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4.5M12 18h.01" />
    </svg>
  </button>

  <Teleport to="body">
    <Transition name="gd">
      <div v-if="ouvert" class="gd-voile" @click.self="fermer">
        <section class="gd-carte" role="dialog" aria-modal="true" aria-labelledby="gd-titre" @touchstart.passive="debutToucher" @touchend.passive="finToucher">
          <div class="gd-etincelles" aria-hidden="true">
            <i v-for="(e, k) in etincelles" :key="k" :style="{ '--x': e.x, '--y': e.y, '--d': e.d, '--t': e.t }"></i>
          </div>

          <header class="gd-tete">
            <span class="gd-kicker">{{ profil.libelle }}</span>
            <span class="gd-compteur">{{ i + 1 }} / {{ etapes.length }}</span>
            <button type="button" class="gd-passer" @click="fermer">Passer</button>
          </header>

          <div class="gd-progres" role="progressbar" aria-valuemin="1" :aria-valuemax="etapes.length" :aria-valuenow="i + 1">
            <span :style="{ width: pct + '%' }"></span>
          </div>

          <Transition :name="sens" mode="out-in">
            <div :key="i" class="gd-etape">
              <div class="gd-visuel">
                <img v-if="i === 0 && !imageKo" :src="profil.image" alt="" class="gd-image" decoding="async" @error="imageKo = true" />
                <div v-else class="gd-icone">
                  <span class="gd-anneau"></span>
                  <span class="gd-anneau gd-anneau--2"></span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path :d="ICONES[etape.icone]" pathLength="1" />
                  </svg>
                </div>
              </div>
              <h2 id="gd-titre" class="gd-titre">{{ etape.titre }}</h2>
              <p class="gd-texte">{{ etape.texte }}</p>
            </div>
          </Transition>

          <nav class="gd-points" aria-label="&Eacute;tapes du guide">
            <button v-for="(e, n) in etapes" :key="n" type="button" class="gd-point" :class="{ 'gd-point--actif': n === i }"
              :aria-label="'Aller \u00e0 l\u2019\u00e9tape ' + (n + 1)" :aria-current="n === i ? 'step' : undefined" @click="aller(n)"></button>
          </nav>

          <footer class="gd-pied">
            <button type="button" class="gd-btn gd-btn--ghost" :disabled="i === 0" @click="precedent"><span aria-hidden="true">&larr;</span> Pr&eacute;c&eacute;dent</button>
            <button ref="btnSuivant" type="button" class="gd-btn gd-btn--or" @click="suivant">{{ dernier ? 'Commencer' : 'Suivant' }} <span aria-hidden="true">&rarr;</span></button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { PROFILS, ICONES, cleVu, profilDe } from '@/utils/guide'

const route = useRoute()
const auth = useAuthStore()
const ouvert = ref(false)
const i = ref(0)
const sens = ref('gd-avant')
const imageKo = ref(false)
const btnSuivant = ref(null)

const profilId = computed(() => profilDe(auth.user))
const profil = computed(() => PROFILS[profilId.value])
const etapes = computed(() => profil.value.etapes)
const etape = computed(() => etapes.value[i.value])
const dernier = computed(() => i.value === etapes.value.length - 1)
const pct = computed(() => Math.round(((i.value + 1) / etapes.value.length) * 100))
const bouton = computed(() => route.name !== 'connexion' && !ouvert.value)

// Petites etincelles dorees : positions fixes, sans hasard (rendu stable)
const etincelles = Array.from({ length: 9 }, (_, k) => ({
  x: ((k * 37 + 11) % 100) + '%',
  y: ((k * 53 + 7) % 100) + '%',
  d: ((k * 0.45) % 3).toFixed(2) + 's',
  t: 3 + (k % 3) * 2 + 'px'
}))

function dejaVu(p) {
  try {
    return localStorage.getItem(cleVu(p)) === '1'
  } catch (e) {
    return false
  }
}
function marquerVu(p) {
  try {
    localStorage.setItem(cleVu(p), '1')
  } catch (e) {
    // Stockage indisponible : le guide pourra se rouvrir seul.
  }
}

function eligible() {
  const p = profilId.value
  if (route.name === 'connexion') return false
  if (p === 'visiteur') return route.name === 'accueil'
  if (p === 'parent') return route.name === 'parent'
  return route.path.startsWith('/admin')
}

let minuteur = null
function planifier() {
  clearTimeout(minuteur)
  if (ouvert.value || !eligible() || dejaVu(profilId.value)) return
  minuteur = setTimeout(() => {
    if (!ouvert.value && eligible() && !dejaVu(profilId.value)) ouvrir()
  }, 1200)
}

function ouvrir() {
  i.value = 0
  sens.value = 'gd-avant'
  imageKo.value = false
  ouvert.value = true
  nextTick(() => { if (btnSuivant.value) btnSuivant.value.focus() })
}
function fermer() {
  ouvert.value = false
  marquerVu(profilId.value)
}
function suivant() {
  if (dernier.value) { fermer(); return }
  sens.value = 'gd-avant'
  i.value++
}
function precedent() {
  if (i.value === 0) return
  sens.value = 'gd-arriere'
  i.value--
}
function aller(n) {
  if (n === i.value) return
  sens.value = n > i.value ? 'gd-avant' : 'gd-arriere'
  i.value = n
}

function surClavier(e) {
  if (!ouvert.value) return
  if (e.key === 'ArrowRight') suivant()
  else if (e.key === 'ArrowLeft') precedent()
  else if (e.key === 'Escape') fermer()
}

let x0 = 0
let y0 = 0
function debutToucher(e) {
  const t = e.changedTouches[0]
  x0 = t.clientX
  y0 = t.clientY
}
function finToucher(e) {
  const t = e.changedTouches[0]
  const dx = t.clientX - x0
  const dy = t.clientY - y0
  if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return
  if (dx < 0) { if (!dernier.value) suivant() } else precedent()
}

watch([() => route.fullPath, profilId], planifier)
watch(profilId, () => { imageKo.value = false })
onMounted(() => {
  window.addEventListener('keydown', surClavier)
  planifier()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', surClavier)
  clearTimeout(minuteur)
})
</script>
