<template>
  <div class="admin" :class="{ 'admin--rail': reduit }">
    <div v-if="ouvert" class="admin__voile" aria-hidden="true" @click="ouvert = false"></div>
    <svg class="admin__onde-bas" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path class="admin__onde-bas-fond" d="M0 70 C240 20 480 110 760 70 C1040 30 1240 90 1440 50 L1440 120 L0 120 Z" /><path class="admin__onde-bas-or" d="M0 70 C240 20 480 110 760 70 C1040 30 1240 90 1440 50 L1440 53 C1240 93 1040 33 760 73 C480 113 240 23 0 78 Z" /></svg>

    <aside class="admin__side" :class="{ 'admin__side--ouvert': ouvert }">
      <RouterLink to="/admin" class="admin__marque" aria-label="Tableau de bord" @click="ouvert = false">
        <LogoRond taille="admin" />
        <Logo fond="sombre" />
        <span class="admin__marque-texte">
          <span class="admin__marque-titre">Servants de Messe</span>
          <span class="admin__marque-sous">Paroisse d&rsquo;Adjagbo</span>
        </span>
      </RouterLink>

      <nav class="admin__nav" aria-label="Navigation admin" @click="ouvert = false">
        <RouterLink v-for="l in liens" :key="l.to" :to="l.to" :title="l.label" :aria-label="l.label"
          exact-active-class="admin__lien--actif" class="admin__lien">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="l.icone" /></svg>
          <span class="admin__lien-texte">{{ l.label }}</span><span v-if="nbDemandes && l.to === '/admin/utilisateurs'" class="admin__badge">{{ nbDemandes }}</span>
        </RouterLink>
      </nav>

      <svg class="admin__onde" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true"><path class="admin__onde-fond" d="M0 28 C70 8 150 52 300 20 L300 60 L0 60 Z" /><path class="admin__onde-or" d="M0 28 C70 8 150 52 300 20 L300 21.5 C150 54 70 11 0 36 Z" /></svg>

      <div class="admin__devise">
        <img src="/images/croix-doree.png" alt="" aria-hidden="true" class="admin__croix" />
        <span class="admin__devise-texte">Samuel Pour<br />Servir</span>
      </div>
      <img src="/images/coin-bd.png" alt="" aria-hidden="true" class="admin__feuille-quitter" />
      <button type="button" class="admin__quitter" title="Déconnexion" aria-label="Déconnexion" @click="quitter">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5V3h4M16 17l5-5-5-5M21 12H9" /></svg>
        <span class="admin__quitter-texte">Déconnexion</span>
      </button>
    </aside>

    <div class="admin__zone">
      <img src="/images/coin-hg.png" alt="" aria-hidden="true" class="admin__feuille-hg" />
      <header class="admin__barre">
        <button type="button" class="admin__icone-btn admin__burger" :aria-expanded="ouvert" aria-label="Ouvrir le menu" @click="ouvert = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <RouterLink to="/admin" class="admin__logo-barre" aria-label="Tableau de bord"><Logo /></RouterLink>
        <button type="button" class="admin__icone-btn admin__reduire" :aria-pressed="reduit"
          :aria-label="reduit ? 'Agrandir le menu' : 'Réduire le menu'" :title="reduit ? 'Agrandir le menu' : 'Réduire le menu'" @click="basculerMenu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" /></svg>
        </button>

        <div class="admin__recherche">
          <svg class="admin__recherche-icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input v-model="q" type="search" placeholder="Rechercher un servant, une station…" aria-label="Rechercher"
            autocomplete="off" @focus="focus = true" @blur="focus = false" @keydown.esc="q = ''" />
          <ul v-if="focus && q.trim().length >= 2" class="admin__resultats">
            <li v-for="r in resultats" :key="r.cle">
              <button type="button" class="admin__resultat" @mousedown.prevent="aller(r)" @keydown.enter.prevent="aller(r)">
                <span>{{ r.label }}</span><small>{{ r.sous }}</small>
              </button>
            </li>
            <li v-if="!resultats.length" class="admin__vide">Aucun résultat.</li>
          </ul>
        </div>

        <div class="admin__actions">
          <button type="button" class="admin__icone-btn" :aria-label="estSombre ? 'Passer au thème clair' : 'Passer au thème sombre'"
            :title="estSombre ? 'Thème clair' : 'Thème sombre'" @click="basculerTheme">
            <svg v-if="!estSombre" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </button>
          <RouterLink to="/admin/parametres" class="admin__user" aria-label="Mon profil et paramètres">
            <Avatar :nom="auth.user?.nom || '?'" :photo="VISUELS.servant" taille="h-9 w-9 text-xs" />
            <span class="admin__user-texte">
              <span class="admin__user-nom">{{ auth.user?.nom }}</span>
              <span class="admin__user-role">{{ role }}</span>
            </span>
          </RouterLink>
        </div>
      </header>
      <main class="admin__contenu"><slot /></main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useServantsStore } from '@/stores/servants'
import Logo from '@/components/Logo.vue'
import LogoRond from '@/components/LogoRond.vue'
import Avatar from '@/components/Avatar.vue'
import { VISUELS } from '@/config'
import { estSombre, basculerTheme } from '@/utils/theme'

const CLE = 'admin-menu-reduit'
import { useDemandesStore } from "@/stores/demandes"
const auth = useAuthStore()
const demandes = useDemandesStore()
demandes.recharger()
const nbDemandes = computed(() => (auth.isAdminGlobal ? demandes.enAttente.length : 0))
const servants = useServantsStore()
const router = useRouter()
const ouvert = ref(false)
const reduit = ref(false)
const q = ref('')
const focus = ref(false)

try {
  reduit.value = localStorage.getItem(CLE) === '1'
} catch (e) {
  // Stockage indisponible : le menu s'ouvre en grand.
}
function basculerMenu() {
  reduit.value = !reduit.value
  try {
    localStorage.setItem(CLE, reduit.value ? '1' : '0')
  } catch (e) {
    // Stockage indisponible : le choix n'est pas conservé.
  }
}

const tous = [
  { to: '/admin', label: 'Tableau de bord', icone: 'M3 12 12 3l9 9M5 10v10h5v-6h4v6h5V10' },
  { to: '/admin/servants', label: 'Servants', icone: 'M16 20v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 20v-1a3 3 0 0 0-2-2.8' },
  { to: '/admin/lieux-de-culte', label: 'Stations', adminSeul: true, icone: 'M12 3v3M10.5 4.5h3M6 21V11l6-4 6 4v10M10 21v-5h4v5' },
  { to: '/admin/evenements', label: 'Événements', icone: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4' },
  { to: '/admin/presences', label: 'Présences', icone: 'M9 12l2 2 4-4M5 4h14v16H5z' },
  { to: '/admin/affectations', label: 'Service de messe', icone: 'M12 3v3M10.5 4.5h3M6 21V11l6-4 6 4v10M10 21v-5h4v5' },
  // Classements fusionnes avec Service de messe (lot 28b)
  { to: '/admin/absences', label: 'Absences', icone: 'M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0' },
  { to: '/admin/sanctions', label: 'Sanctions', icone: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z' },
  { to: '/admin/rapports', label: 'Rapports', icone: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6' },
  { to: '/admin/statistiques', label: 'Statistiques', adminSeul: true, icone: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', adminSeul: true, icone: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21a8 8 0 0 1 16 0' },
  { to: '/admin/parametres', label: 'Paramètres', icone: 'M4 7h9M17 7h3M4 17h3M11 17h9M13 5v4M7 15v4' }
]
const liens = computed(() => tous.filter((l) => !l.adminSeul || auth.isAdminGlobal))
const role = computed(() => (auth.isAdminGlobal ? 'Administrateur' : 'Responsable de lieu de culte'))

const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const resultats = computed(() => {
  const t = norm(q.value.trim())
  if (t.length < 2) return []
  const s = servants.liste
    .filter((x) => x.actif && (auth.isAdminGlobal || x.lieu === auth.user?.lieu) && norm(`${x.prenom} ${x.nom}`).includes(t))
    .slice(0, 5)
    .map((x) => ({ cle: `s${x.id}`, label: `${x.prenom} ${x.nom}`, sous: servants.nomLieu(x.lieu), to: { name: 'servant', params: { id: x.id } } }))
  const l = servants.lieux
    .filter((x) => norm(x.nom).includes(t))
    .map((x) => ({ cle: `l${x.id}`, label: x.nom, sous: x.type, to: { name: 'classements', query: { lieu: x.id } } }))
  return [...s, ...l]
})
function aller(r) {
  q.value = ''
  router.push(r.to)
}

async function quitter() {
  // Navigation d abord : les pages admin lisent auth.user, qui vaut null apres la deconnexion.
  ouvert.value = false
  await router.push({ name: 'accueil' })
  await nextTick()
  auth.logout()
}
</script>