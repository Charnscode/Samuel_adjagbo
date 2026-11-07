<template>
  <div class="page-fond">
    <PageDeco />
    <div class="page-contenu dem2-page">
      <div class="page-entete">
        <h1 class="page-titre">Demande d&rsquo;acc&egrave;s pour les parents</h1>
        <p class="page-sous">Un compte parent permet de suivre son enfant : photo, postes de service, absences et &eacute;v&eacute;nements. Votre demande est transmise &agrave; l&rsquo;administrateur de la paroisse, qui cr&eacute;e le compte apr&egrave;s v&eacute;rification.</p>
      </div>

      <section class="dem2-carte">
        <span class="dem2-trait dem2-trait--haut" aria-hidden="true"></span>
        <span class="dem2-trait dem2-trait--bas" aria-hidden="true"></span>
        <img src="/images/coin-hg.png" alt="" aria-hidden="true" class="dem2-feuille dem2-feuille--hg" />
        <img src="/images/coin-bd.png" alt="" aria-hidden="true" class="dem2-feuille dem2-feuille--bd" />

        <div v-if="envoye" class="dem2-merci">
          <p class="par-info" role="status">Votre demande a bien &eacute;t&eacute; transmise &agrave; l&rsquo;administrateur. Il vous contactera pour vous remettre vos identifiants.</p>
          <RouterLink to="/" class="table-pub__lien">Retour &agrave; l&rsquo;accueil</RouterLink>
        </div>

        <form v-else class="dem2-form" @submit.prevent="envoyer">
          <div class="dem2-grille">
            <label class="dem-label">Votre nom complet
              <input v-model="f.nomParent" v-saisie="NOM" class="champ !mt-0" required maxlength="80" autocomplete="name" />
            </label>
            <label class="dem-label">Votre num&eacute;ro de t&eacute;l&eacute;phone
              <input v-model="f.telephone" v-saisie="TEL" type="tel" class="champ !mt-0" required maxlength="30" autocomplete="tel" placeholder="+229 ..." />
            </label>
            <label class="dem-label">Votre e-mail (facultatif)
              <input v-model="f.email" v-saisie="EMAIL" type="email" class="champ !mt-0" maxlength="80" autocomplete="email" />
            </label>
            <label class="dem-label">Votre lien avec l&rsquo;enfant
              <select v-model="f.lien" class="champ !mt-0 page-select"><option v-for="l in LIENS" :key="l">{{ l }}</option></select>
            </label>
            <fieldset class="dem2-choix dem2-plein">
              <legend>Enfant ou enfants servants concern&eacute;s (plusieurs choix possibles)</legend>
              <input v-model="recherche" type="search" class="champ !mt-0" placeholder="Rechercher un servant&hellip;" aria-label="Rechercher un servant" />
              <p v-if="chargement" class="page-sous">Chargement de la liste&hellip;</p>
              <p v-else-if="!servantsFiltres.length" class="page-sous">Aucun servant ne correspond.</p>
              <ul v-else class="dem2-liste">
                <li v-for="s in servantsFiltres" :key="s.id">
                  <label class="dem2-option"><input v-model="f.enfantIds" type="checkbox" :value="s.id" /> <span>{{ s.nomComplet }}</span> <small>{{ s.lieu }}</small></label>
                </li>
              </ul>
            </fieldset>
            <label class="dem-label dem2-plein">Message (facultatif)
              <textarea v-model="f.message" class="champ !mt-0" rows="3" maxlength="500"></textarea>
            </label>
          </div>
          <input v-model="piege" class="dem-piege" tabindex="-1" autocomplete="off" aria-hidden="true" />
          <label class="dem-consent dem2-plein"><input v-model="accord" type="checkbox" required /> J&rsquo;accepte que ces informations soient transmises &agrave; l&rsquo;administrateur de la paroisse pour traiter ma demande. Elles ne sont jamais affich&eacute;es publiquement.</label>
          <p v-if="erreur" class="par-alerte dem2-plein" role="alert">{{ erreur }}</p>
          <div class="dem-actions dem2-plein">
            <button type="submit" class="pill-gold">Envoyer la demande <span aria-hidden="true">&rarr;</span></button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import PageDeco from "@/components/PageDeco.vue"
import { publicApi } from "@/services/api"
import { useDemandesStore, LIENS } from "@/stores/demandes"
import { vSaisie, verifierNom, verifierTelephone, verifierEmail } from "@/utils/saisie"

const NOM = "nom"
const TEL = "telephone"
const EMAIL = "email"
const demandes = useDemandesStore()
const servants = ref([])
const chargement = ref(true)
const recherche = ref("")
const f = ref({ nomParent: "", telephone: "", email: "", lien: LIENS[0], enfantIds: [], message: "" })
const piege = ref("")
const accord = ref(false)
const erreur = ref("")
const envoye = ref(false)

const servantsFiltres = computed(() => {
  const t = recherche.value.trim().toLowerCase()
  return servants.value.filter((s) => !t || String(s.nomComplet).toLowerCase().includes(t))
})

function envoyer() {
  erreur.value = ""
  if (piege.value) { envoye.value = true; return }
  const erreurSaisie = verifierNom(f.value.nomParent, "Votre nom") || verifierTelephone(f.value.telephone) || (f.value.email ? verifierEmail(f.value.email) : "")
  if (erreurSaisie) { erreur.value = erreurSaisie; return }
  const enfants = servants.value.filter((s) => f.value.enfantIds.includes(s.id)).map((s) => ({ id: s.id, nomComplet: s.nomComplet, lieu: s.lieu }))
  try {
    demandes.envoyer({ ...f.value, enfants })
    envoye.value = true
  } catch (err) {
    erreur.value = err.message
  }
}

onMounted(async () => {
  servants.value = (await publicApi.servants()) || []
  chargement.value = false
})
</script>
