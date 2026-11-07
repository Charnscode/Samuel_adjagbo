<template>
  <div class="accueil">
    <section class="accueil__hero">
      <img :src="VISUELS.accueil" alt="" class="accueil__photo" />
      <div class="accueil__voile" aria-hidden="true"></div>
      <div class="accueil__contenu">
        <div class="accueil__bloc animate-fade-up-delayed">
          <LogoRond taille="hero" class="logo-rond--flotte" />
          <h1 class="accueil__titre">
            Plateforme de gestion<br />
            des <span class="accueil__or">servants de messe</span>
          </h1>
          <p class="accueil__etab">Paroisse d&rsquo;Adjagbo</p>
          <p class="accueil__station">Stations de D&ocirc;me et d&rsquo;Ayimlonfid&eacute;</p>
          <p class="accueil__resume">
            Suivi de la pr&eacute;sence, classement et gestion des servants de messe de la paroisse, en toute transparence.
          </p>
          <div class="accueil__boutons">
            <RouterLink to="/classements" class="pill-gold">Voir les classements <span aria-hidden="true">&rarr;</span></RouterLink>
            <RouterLink to="/a-propos" class="pill-ghost">
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              En savoir plus
            </RouterLink>
          </div>
        </div>
      </div>
      <div class="accueil__vague" aria-hidden="true">
        <svg viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path class="accueil__vague-halo" d="M0 58 C200 58 320 138 520 128 C720 118 820 28 1000 38 C1180 48 1300 118 1440 108 L1440 120 C1300 130 1180 60 1000 50 C820 40 720 130 520 140 C320 150 200 70 0 70 Z" />
          <path class="accueil__vague-or" d="M0 70 C200 70 320 150 520 140 C720 130 820 40 1000 50 C1180 60 1300 130 1440 120 L1440 124 C1300 135 1180 66 1000 56 C820 47 720 138 520 150 C320 161 200 83 0 84 Z" />
          <path class="accueil__vague-fond" d="M0 84 C200 83 320 161 520 150 C720 138 820 47 1000 56 C1180 66 1300 135 1440 124 L1440 200 L0 200 Z" />
        </svg>
      </div>
    </section>

    <section class="accueil__bas">
      <img src="/images/coin-hg.png" alt="" aria-hidden="true" class="accueil__feuille feuille-coin feuille-hg" />
      <img src="/images/coin-hd.png" alt="" aria-hidden="true" class="accueil__feuille feuille-coin feuille-hd" />
      <img src="/images/coin-bg.png" alt="" aria-hidden="true" class="accueil__feuille feuille-coin feuille-bg" />
      <img src="/images/coin-bd.png" alt="" aria-hidden="true" class="accueil__feuille feuille-coin feuille-bd" />
      <div class="accueil__lieux">
        <h2 class="accueil__rubrique">Nos lieux de culte</h2>
        <div class="accueil__grille">
          <div v-for="l in lieux" :key="l.id" class="lieu-carte" role="button" tabindex="0" aria-haspopup="dialog"
            @click="actif = l.id" @keydown.enter.prevent="actif = l.id" @keydown.space.prevent="actif = l.id">
            <img :src="imageLieu(l.id)" :alt="`Église de ${l.nom}`" class="lieu-carte__image" />
            <div class="lieu-carte__corps">
              <span class="lieu-carte__icone"><EgliseIcon class="h-6 w-6" /></span>
              <span class="lieu-carte__texte">
                <span class="lieu-carte__nom">{{ l.nom }}</span>
                <span class="lieu-carte__type">{{ l.type }}</span>
              </span>
              <RouterLink :to="{ name: 'classements', query: { lieu: l.id } }" class="lieu-carte__fleche"
                :aria-label="`Voir les classements de ${l.nom}`" @click.stop>&rarr;</RouterLink>
            </div>
          </div>
        </div>
        <section v-if="evenements.length" class="accueil__evenements" aria-labelledby="ev-titre">
          <h2 id="ev-titre" class="accueil__rubrique">&Eacute;v&eacute;nements en cours</h2>
          <div class="ev-grille">
            <article v-for="e in evenements" :key="e.id" class="ev-carte">
              <button type="button" class="ev-carte__tete" aria-haspopup="dialog" @click="ouvrirEvenement(e.id)">
                <img v-if="e.image" :src="e.image" alt="" class="ev-carte__image" />
                <span class="ev-carte__corps">
                  <span class="ev-carte__type">{{ e.type }}<span v-if="e.statut === 'en_cours'" class="ev-carte__live">En cours</span></span>
                  <span class="ev-carte__titre">{{ e.titre }}</span>
                  <span class="ev-carte__date">{{ libellePeriode(e) }} &middot; {{ e.lieu }}</span>
                  <span class="ev-carte__plus">Voir les d&eacute;tails <span aria-hidden="true">&rarr;</span></span>
                </span>
              </button>
            </article>
          </div>
        </section>
      </div>
    </section>

    <Teleport to="body">
      <Transition name="lieu-modal">
        <div v-if="courant" class="lieu-modal" role="dialog" aria-modal="true" :aria-label="`Présentation : ${courant.nom}`" @click.self="actif = null">
          <div class="lieu-modal__carte lieu-modal__carte--image">
            <button type="button" class="lieu-modal__fermer" aria-label="Fermer" @click="actif = null">×</button>
            <div class="lieu-modal__grille">
              <div class="lieu-modal__visuel">
                <img :src="imageLieu(courant.id)" :alt="`Église de ${courant.nom}`" />
              </div>
              <div class="lieu-modal__contenu">
                <span class="lieu-modal__type">{{ courant.type }}</span>
                <h3 class="lieu-modal__titre">{{ courant.nom }}</h3>
                <p class="lieu-modal__texte">Suivez en toute transparence la présence et le classement des servants de messe de {{ courant.nom }}.</p>
                <ul class="lieu-modal__liste">
                  <li>Postes de la messe de la semaine</li>
                  <li>Classement du dimanche</li>
                  <li>Suivi des absences (code couleur)</li>
                </ul>
                <RouterLink :to="{ name: 'classements', query: { lieu: courant.id } }" class="lieu-modal__aller">
                  Voir les classements <span aria-hidden="true">&rarr;</span>
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </Transition>
      <Transition name="lieu-modal">
        <div v-if="evCourant" class="lieu-modal" role="dialog" aria-modal="true" :aria-label="`Événement : ${evCourant.titre}`" @click.self="evActif = null">
          <div class="lieu-modal__carte lieu-modal__carte--image ev-modal">
            <button type="button" class="lieu-modal__fermer" aria-label="Fermer" @click="evActif = null">×</button>
            <div class="lieu-modal__grille" :class="{ 'lieu-modal__grille--sans-image': !evCourant.image }">
              <div v-if="evCourant.image" class="lieu-modal__visuel">
                <img :src="evCourant.image" alt="" />
              </div>
              <div class="lieu-modal__contenu">
                <span class="lieu-modal__type">{{ evCourant.type }}<span v-if="evCourant.statut === 'en_cours'" class="ev-carte__live">En cours</span></span>
                <h3 class="lieu-modal__titre">{{ evCourant.titre }}</h3>
                <dl class="ev-modal__infos">
                  <div><dt>Quand</dt><dd>{{ libellePeriode(evCourant) }}</dd></div>
                  <div><dt>Lieu de culte</dt><dd>{{ evCourant.lieu }}</dd></div>
                  <div v-if="evCourant.lieuPrecis"><dt>Lieu précis</dt><dd>{{ evCourant.lieuPrecis }}</dd></div>
                  <div v-if="evCourant.concernes !== 'tous'"><dt>Concernés</dt><dd>{{ evCourant.concernes }}</dd></div>
                  <div v-if="evCourant.description"><dt>Description</dt><dd>{{ evCourant.description }}</dd></div>
                  <div v-if="evCourant.consignes"><dt>Consignes</dt><dd>{{ evCourant.consignes }}</dd></div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import EgliseIcon from "@/components/EgliseIcon.vue"
import LogoRond from "@/components/LogoRond.vue"
import { VISUELS } from "@/config"
import { imageLieu } from "@/utils/visuels"
import { publicApi } from "@/services/api"
import { libellePeriode } from "@/stores/evenements"

const lieux = ref([])
const actif = ref(null)
const evenements = ref([])
const evActif = ref(null)
const courant = computed(() => lieux.value.find((l) => l.id === actif.value) || null)
const evCourant = computed(() => evenements.value.find((e) => e.id === evActif.value) || null)

// La liste est rechargee a chaque ouverture : une image modifiee dans l administration apparait tout de suite.
function ouvrirEvenement(id) {
  evActif.value = id
  publicApi.evenements().then((l) => { evenements.value = l })
}

function echap(e) { if (e.key === "Escape") { actif.value = null; evActif.value = null } }
onMounted(async () => {
  window.addEventListener("keydown", echap)
  lieux.value = await publicApi.lieux()
  evenements.value = await publicApi.evenements()
})
onUnmounted(() => window.removeEventListener("keydown", echap))
</script>
