<template>
  <div class="connexion">
    <aside class="connexion__gauche">
      <img :src="VISUELS.connexion" alt="" class="connexion__photo" />
      <div class="connexion__voile" aria-hidden="true"></div>
      <blockquote class="connexion__citation">
        <p>&laquo; Servir: est et demeure notre mission &raquo;</p>
        <span class="connexion__trait" aria-hidden="true"></span>
      </blockquote>
      <svg class="connexion__vague" viewBox="0 0 800 300" preserveAspectRatio="none" aria-hidden="true">
        <path class="cx-vague-b" d="M0 70 C200 40 380 100 560 190 C660 240 740 262 800 268 L800 300 L0 300 Z" />
        <path class="cx-vague-a" d="M0 120 C200 100 360 150 540 225 C640 262 720 280 800 286 L800 300 L0 300 Z" />
        <path class="cx-vague-or" d="M0 118 C200 98 360 148 540 223 C640 260 720 278 800 284" />
      </svg>
      <img src="/images/coin-bg.png" alt="" aria-hidden="true" class="connexion__feuille connexion__feuille--bg" />
    </aside>

    <main class="connexion__droite">
      <img src="/images/coin-hd.png" alt="" aria-hidden="true" class="connexion__feuille connexion__feuille--hd" />
      <form class="cx-carte animate-fade-up" @submit.prevent="soumettre">
        <RouterLink to="/" class="cx-marque" aria-label="Retour &agrave; l&rsquo;accueil">
          <Logo />
          <span>
            <span class="cx-marque__titre">Servants de Messe</span>
            <span class="cx-marque__sous">Paroisse d&rsquo;Adjagbo</span>
          </span>
        </RouterLink>

        <div>
          <LogoRond taille="carte" class="logo-rond--centre" />
          <h1 class="cx-titre">Se connecter</h1>
          <p class="cx-sous">Acc&eacute;dez &agrave; votre espace (administrateur, responsable de lieu ou parent).</p>
        </div>

        <label class="cx-label">
          <span class="cx-label__ligne">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 6h16v12H4zM4 7l8 6 8-6" />
            </svg>
            E-mail ou identifiant
          </span>
          <input v-model="identifiant" class="cx-champ" required autocomplete="username" placeholder="exemple@domaine.org" />
        </label>

        <label class="cx-label">
          <span class="cx-label__ligne">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            Mot de passe
          </span>
          <span class="cx-champ-zone">
            <input v-model="motDePasse" :type="voir ? 'text' : 'password'" class="cx-champ cx-champ--oeil" required
              autocomplete="current-password" placeholder="Entrez votre mot de passe" />
            <button type="button" class="cx-oeil" :aria-label="voir ? 'Masquer le mot de passe' : 'Afficher le mot de passe'" @click="voir = !voir">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                <circle cx="12" cy="12" r="3" />
                <path v-if="voir" d="M3 3l18 18" />
              </svg>
            </button>
          </span>
        </label>

        <div class="cx-options">
          <label class="cx-souvenir"><input v-model="souvenir" type="checkbox" /> Se souvenir de moi</label>
          <button type="button" class="cx-lien" @click="aide = messageOubli">Mot de passe oubli&eacute; ?</button>
        </div>

        <p v-if="erreur" class="cx-erreur" role="alert">{{ erreur }}</p>
        <p v-if="aide" class="cx-aide" role="status">{{ aide }}</p>

        <button class="pill-gold cx-bouton" type="submit" :disabled="envoi">
          Se connecter <span aria-hidden="true">&rarr;</span>
        </button>

        <hr class="cx-sep" />
        <div class="cx-pied">
          <p>Aucun acc&egrave;s ? <RouterLink to="/acces" class="cx-lien">Parents : demander un acc&egrave;s</RouterLink></p>
          <p><RouterLink to="/classements" class="cx-lien">Consulter les classements sans compte</RouterLink></p>
          <p v-if="USE_MOCK" class="cx-demo">D&eacute;mo : admin / admin &middot; dome / dome &middot; parent / parent</p>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Logo from '@/components/Logo.vue'
import LogoRond from '@/components/LogoRond.vue'
import { VISUELS, USE_MOCK } from '@/config'

const CLE = 'identifiant-memorise'
const messageOubli = 'La réinitialisation du mot de passe est assurée par l\u2019administrateur global. Contactez-le pour obtenir un nouveau mot de passe.'
const messageAcces = 'Les acc\u00e8s sont cr\u00e9\u00e9s par l\u2019administrateur global de la paroisse. Les parents qui souhaitent recevoir les alertes, les \u00e9v\u00e9nements et la photo de leur enfant lui adressent leur demande.'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const identifiant = ref('')
const motDePasse = ref('')
const voir = ref(false)
const souvenir = ref(false)
const erreur = ref('')
const aide = ref('')
const envoi = ref(false)

onMounted(() => {
  try {
    const v = localStorage.getItem(CLE)
    if (v) { identifiant.value = v; souvenir.value = true }
  } catch (e) {
    // Stockage indisponible : rien n'est prérempli.
  }
})

function memoriser() {
  try {
    if (souvenir.value) localStorage.setItem(CLE, identifiant.value.trim())
    else localStorage.removeItem(CLE)
  } catch (e) {
    // Stockage indisponible : le choix n'est pas conservé.
  }
}

async function soumettre() {
  erreur.value = ''
  aide.value = ''
  envoi.value = true
  try {
    await auth.login(identifiant.value.trim(), motDePasse.value)
    memoriser()
    router.push(route.query.redirect || { name: auth.user?.role === 'parent' ? 'parent' : 'admin-dashboard' })
  } catch (e) {
    erreur.value = e.message
  } finally {
    envoi.value = false
  }
}
</script>