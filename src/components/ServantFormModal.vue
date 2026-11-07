<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4" @click.self="$emit('fermer')">
    <form class="card w-full max-w-lg space-y-4 p-6" role="dialog" aria-modal="true" :aria-label="titre"
      @submit.prevent="soumettre">
      <h2 class="text-lg font-bold text-navy-900">{{ titre }}</h2>

      <ImageChamp v-model="f.photo" label="Photo de profil" forme="rond" :cote="480" :disabled="mode === 'voir'" />
      <div v-if="mode === 'edition' && ancienne" class="flex flex-wrap items-center gap-3 text-sm">
        <Avatar :nom="`${f.prenom} ${f.nom}`" :photo="ancienne.image" taille="h-10 w-10 text-xs" />
        <button type="button" class="font-semibold text-brand" @click="ramenerAncienne">Ramener l&rsquo;ancienne photo</button>
        <span class="text-xs text-slate-500">Encore {{ joursRestants }} jour(s) pour la r&eacute;cup&eacute;rer.</span>
      </div>

      <fieldset :disabled="mode === 'voir'" class="grid gap-4 sm:grid-cols-2">
        <label class="text-sm font-medium">Prénom
          <input v-model.trim="f.prenom" v-saisie="'nom'" required class="champ" />
        </label>
        <label class="text-sm font-medium">Nom
          <input v-model.trim="f.nom" v-saisie="'nom'" required class="champ" />
        </label>
        <label class="text-sm font-medium">Grade
          <select v-model="f.grade" class="champ">
            <option v-for="g in GRADES" :key="g">{{ g }}</option>
          </select>
        </label>
        <label class="text-sm font-medium">Contact (téléphone)
          <input v-model.trim="f.contact" v-saisie="'telephone'" type="tel" required class="champ" />
        </label>
        <label class="text-sm font-medium">Date de naissance
          <input v-model="f.dateNaissance" type="date" :max="aujourdhui" min="1950-01-01" required class="champ" />
        </label>
        <label v-if="!lieuFixe" class="text-sm font-medium">Lieu de culte
          <select v-model="f.lieu" class="champ">
            <option v-for="l in lieux" :key="l.id" :value="l.id">{{ l.nom }}</option>
          </select>
        </label>
      </fieldset>

      <p v-if="mode === 'edition' && servant && f.lieu !== servant.lieu" class="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Changer le lieu enregistre une mutation : l’historique du servant est conservé.
      </p>

      <p v-if="erreur" class="text-sm text-red-600" role="alert">{{ erreur }}</p>

      <div class="flex justify-end gap-2">
        <button type="button" class="btn border border-slate-300" @click="$emit('fermer')">{{ mode === 'voir' ? 'Fermer' : 'Annuler' }}</button>
        <button v-if="mode !== 'voir'" type="submit" class="btn-primary">Enregistrer</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { vSaisie, verifierNom, verifierTelephone, verifierDateNaissance } from '@/utils/saisie'
import { GRADES } from '@/stores/servants'
import ImageChamp from '@/components/ImageChamp.vue'
import Avatar from '@/components/Avatar.vue'
import { photoRecuperable, joursRestantsPhoto } from '@/utils/photo'

const props = defineProps({
  mode: { type: String, required: true }, // 'ajout' | 'edition' | 'voir'
  servant: { type: Object, default: null },
  lieux: { type: Array, required: true },
  lieuFixe: { type: String, default: null }
})
const emit = defineEmits(['fermer', 'enregistrer'])

const ancienne = computed(() => (props.servant && photoRecuperable(props.servant.photoPrecedente) ? props.servant.photoPrecedente : null))
const joursRestants = computed(() => (ancienne.value ? joursRestantsPhoto(ancienne.value) : 0))
function ramenerAncienne() { if (ancienne.value) f.photo = ancienne.value.image }

const erreur = ref("")
const aujourdhui = new Date().toISOString().slice(0, 10)
function soumettre() {
  const e = verifierNom(f.prenom, "Pr\u00e9nom") || verifierNom(f.nom, "Nom") || verifierTelephone(f.contact) || verifierDateNaissance(f.dateNaissance)
  if (e) { erreur.value = e; return }
  erreur.value = ""
  emit("enregistrer", { ...f, prenom: f.prenom.trim(), nom: f.nom.trim(), contact: f.contact.trim() })
}

const titre = computed(() => ({ ajout: 'Ajouter un servant', edition: 'Modifier le servant', voir: 'Fiche du servant' })[props.mode])

const f = reactive(props.servant
  ? { prenom: props.servant.prenom, nom: props.servant.nom, grade: props.servant.grade, contact: props.servant.contact, dateNaissance: props.servant.dateNaissance, lieu: props.servant.lieu, photo: props.servant.photo || null }
  : { prenom: '', nom: '', grade: 'Postulant', contact: '', dateNaissance: '', lieu: props.lieuFixe || props.lieux[0]?.id, photo: null })
</script>
