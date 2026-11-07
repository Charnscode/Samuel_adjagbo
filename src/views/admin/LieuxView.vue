<template>
  <div class="lx">
    <header class="lx__tete">
      <div class="lx__titre-bloc">
        <span class="lx__titre-icone"><EgliseIcon class="h-7 w-7" /></span>
        <div>
          <h1 class="lx__titre">Lieux de culte</h1>
          <p class="lx__sous">Gérez les lieux de culte de votre paroisse.</p>
        </div>
      </div>
      <button type="button" class="lx__ajout" @click="ouvrir">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        Ajouter un lieu de culte
      </button>
    </header>

    <p v-if="message" class="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700" role="status">{{ message }}</p>
    <p v-if="erreur" class="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">{{ erreur }}</p>

    <h2 class="lx__liste-titre">Liste des lieux de culte</h2>
    <div class="lx__grille">
      <article v-for="l in lieux" :key="l.id" class="lx__carte">
        <span class="lx__image">
          <img v-if="l.image" :src="l.image" :alt="`Église de ${l.nom}`" />
          <EgliseIcon v-else class="h-8 w-8" />
        </span>
        <h3 class="lx__nom">{{ l.nom }}</h3>
        <p class="lx__ligne">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" /></svg>
          {{ l.type }}
        </p>
        <p class="lx__ligne">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 20v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 20v-1a3 3 0 0 0-2-2.8" /></svg>
          {{ l.effectif }} {{ l.effectif > 1 ? 'servants' : 'servant' }}
        </p>
        <RouterLink :to="{ name: 'admin-servants', query: { lieu: l.id } }" class="lx__voir">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6" /></svg>
          Voir
        </RouterLink>
        <div class="lx__outils">
          <button type="button" class="lx__lien" @click="ouvrirImage(l)">Changer l’image</button>
          <button v-if="l.type !== 'Paroisse'" type="button" class="lx__lien lx__lien--danger" :disabled="l.effectif > 0"
            :title="l.effectif > 0 ? 'Transférez d’abord les servants' : 'Supprimer ce lieu'" @click="supprimer(l)">Supprimer</button>
        </div>
      </article>
    </div>

    <p class="lx__info">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
      <span>La plateforme est actuellement en mode de gestion. Cliquez sur un lieu de culte pour accéder à la gestion de ses servants.</span>
    </p>

    <Teleport to="body"><div v-if="modal" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4" @click.self="modal = false">
      <form class="card w-full max-w-sm space-y-4 p-6" role="dialog" aria-modal="true" aria-label="Ajouter un lieu de culte" @submit.prevent="ajouter">
        <h2 class="text-lg font-bold text-navy-900">Ajouter un lieu de culte</h2>
        <label class="block text-sm font-medium">Nom de la station
          <input v-model.trim="nom" required class="champ" placeholder="Ex. Sainte-Marie" />
        </label>
        <ImageChamp v-model="imageNouveau" label="Image du lieu de culte" forme="carre" :cote="900" />
        <p class="text-xs text-slate-500">La nouvelle station sera rattachée à la paroisse d’Adjagbo.</p>
        <p v-if="erreurForm" class="text-sm text-red-600" role="alert">{{ erreurForm }}</p>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn border border-slate-300" @click="modal = false">Annuler</button>
          <button type="submit" class="btn-primary">Ajouter</button>
        </div>
      </form>
    </div></Teleport>

    <Teleport to="body"><div v-if="modalImage" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4" @click.self="modalImage = null">
      <form class="card w-full max-w-sm space-y-4 p-6" role="dialog" aria-modal="true" :aria-label="`Image de ${modalImage.nom}`" @submit.prevent="enregistrerImage">
        <h2 class="text-lg font-bold text-navy-900">Image de {{ modalImage.nom }}</h2>
        <ImageChamp v-model="imageEdition" label="Image du lieu de culte" forme="carre" :cote="900" />
        <p class="text-xs text-slate-500">Cette image s’affiche sur les cartes de l’accueil et partout où le lieu est présenté.</p>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn border border-slate-300" @click="modalImage = null">Annuler</button>
          <button type="submit" class="btn-primary">Enregistrer</button>
        </div>
      </form>
    </div></Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useServantsStore } from '@/stores/servants'
import { imageLieu } from '@/utils/visuels'
import EgliseIcon from '@/components/EgliseIcon.vue'
import ImageChamp from '@/components/ImageChamp.vue'

const store = useServantsStore()
const modal = ref(false)
const nom = ref('')
const imageNouveau = ref(null)
const modalImage = ref(null) // { id, nom }
const imageEdition = ref(null)
const message = ref('')
const erreur = ref('')
const erreurForm = ref('')

const lieux = computed(() => store.lieux.map((l) => ({ ...l, image: imageLieu(l.id), effectif: store.liste.filter((s) => s.lieu === l.id).length })))

function notifier(t) { message.value = t; setTimeout(() => (message.value = ''), 3500) }
function ouvrir() { nom.value = ''; imageNouveau.value = null; erreurForm.value = ''; modal.value = true }

function ajouter() {
  try { store.ajouterLieu(nom.value, imageNouveau.value); modal.value = false; notifier('Lieu de culte ajouté.') }
  catch (e) { erreurForm.value = e.message }
}

function ouvrirImage(l) { imageEdition.value = l.image; modalImage.value = { id: l.id, nom: l.nom } }
function enregistrerImage() {
  store.modifierImageLieu(modalImage.value.id, imageEdition.value)
  modalImage.value = null
  notifier('Image du lieu mise à jour.')
}

function supprimer(l) {
  erreur.value = ''
  if (!confirm(`Supprimer le lieu « ${l.nom} » ?`)) return
  try { store.supprimerLieu(l.id); notifier('Lieu de culte supprimé.') }
  catch (e) { erreur.value = e.message }
}
</script>
