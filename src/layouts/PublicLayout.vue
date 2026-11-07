<template>
  <div class="page-publique">
    <header class="site-header">
      <div class="site-header__barre">
        <RouterLink to="/" aria-label="Accueil" class="site-header__marque">
          <LogoRond taille="site" />
          <Logo />
          <span class="site-header__texte">
            <span class="site-header__titre">Servants de Messe</span>
            <span class="site-header__sous">Paroisse d&rsquo;Adjagbo</span>
          </span>
        </RouterLink>

        <nav class="site-header__nav" aria-label="Navigation principale">
          <RouterLink v-for="l in liens" :key="l.to" :to="l.to" class="site-nav-link"
            active-class="site-nav-link--actif">{{ l.label }}</RouterLink>
        </nav>

        <div class="site-header__actions">
          <button type="button" class="theme-toggle"
            :aria-label="estSombre ? 'Passer au thème clair' : 'Passer au thème sombre'"
            :title="estSombre ? 'Thème clair' : 'Thème sombre'" @click="basculerTheme">
            <svg v-if="!estSombre" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
            <svg v-else viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </button>

          <RouterLink :to="lienCompte" class="pill-gold site-header__connexion">
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
            </svg>
            {{ libelleCompte }}
          </RouterLink>

          <button type="button" class="menu-bouton" :aria-expanded="ouvert" aria-label="Menu" @click="ouvert = !ouvert">
            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path :d="ouvert ? 'M6 6l12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16'" />
            </svg>
          </button>
        </div>
      </div>

      <nav v-if="ouvert" class="menu-mobile" aria-label="Navigation mobile" @click="ouvert = false">
        <RouterLink v-for="l in liens" :key="l.to" :to="l.to" class="menu-mobile__lien"
          active-class="menu-mobile__lien--actif">{{ l.label }}</RouterLink>
        <RouterLink :to="lienCompte" class="pill-gold mt-2 self-start">{{ libelleCompte }}</RouterLink>
      </nav>
    </header>
    <div v-if="ouvert" class="menu-voile" aria-hidden="true" @click="ouvert = false"></div>

    <main class="page-publique__main"><slot /></main>

    <footer class="pied">
      <svg class="pied__onde" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="pied-degrade" x1="0" y1="0" x2="0" y2="1">
            <stop class="pied-g-haut" offset="0" />
            <stop class="pied-g-bas" offset="1" />
          </linearGradient>
        </defs>
        <path d="M0 46 C240 46 360 14 560 20 C760 26 860 72 1040 66 C1220 60 1320 20 1440 26 L1440 80 L0 80 Z" fill="url(#pied-degrade)" />
      </svg>
      <div class="pied__ligne" aria-hidden="true"></div>
      <div class="pied__fond">
        <div class="pied__photo"><img :src="VISUELS.banniere" alt="" /></div>
        <img src="/images/coin-hg.png" alt="" aria-hidden="true" class="pied__feuille-coin pied__feuille-coin--hg" />
        <img src="/images/coin-bd.png" alt="" aria-hidden="true" class="pied__feuille-coin pied__feuille-coin--bd" />
        <div class="pied__corps">
          <div class="pied__grille">
            <blockquote class="pied__citation">
              &laquo; Samuel : Pr&eacute;sence- &Eacute;coute- Disponibilit&eacute; &raquo;
            </blockquote>
            <div class="pied__marque">
              <LogoRond taille="pied" />
              <Logo fond="sombre" />
              <span class="pied__sep" aria-hidden="true"></span>
              <div>
                <p class="pied__titre">Servants de Messe</p>
                <p class="pied__sous">Paroisse d&rsquo;Adjagbo</p>
              </div>
            </div>
            <div class="pied__liste-bloc">
              <ul class="pied__liste">
                <li v-for="e in engagements" :key="e.label">
                  <svg viewBox="0 0 24 24" class="pied__icone" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path :d="e.d" />
                  </svg>
                  {{ e.label }}
                </li>
              </ul>
              <p class="pied__devise">Ensemble pour une meilleure gestion des servants de messe.</p>
            </div>
          </div>
          <div class="pied__copie">
            &copy; {{ new Date().getFullYear() }} Plateforme de gestion des servants de messe, Paroisse d&rsquo;Adjagbo : D&ocirc;me, Adjagbo et Ayimlonfid&eacute;
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Logo from '@/components/Logo.vue'
import LogoRond from '@/components/LogoRond.vue'
import { VISUELS } from '@/config'
import { estSombre, basculerTheme } from '@/utils/theme'
import { useAuthStore } from '@/stores/auth'

const ouvert = ref(false)
const auth = useAuthStore()
const lienCompte = computed(() => (!auth.isAuthenticated ? "/connexion" : auth.isParent ? "/parent" : "/admin"))
const libelleCompte = computed(() => (!auth.isAuthenticated ? "Connexion" : "Mon espace"))
const engagements = [
  { label: 'Présencee', d: 'M4 5h16v11H9l-5 4z' },
  { label: 'Ecoute', d: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4' },
  { label: 'Disponibilité', d: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z' },
]
const liens = [
  { to: '/', label: 'Accueil' },
  { to: '/classements', label: 'Classements' },
  { to: '/absences', label: 'Absences' },
  { to: '/servants', label: 'Servants' },
  { to: '/a-propos', label: 'À propos' }
]
</script>
