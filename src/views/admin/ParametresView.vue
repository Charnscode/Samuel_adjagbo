<template>
  <div>
    <h1 class="tb-titre">Param&egrave;tres</h1>
    <span class="tb-trait" aria-hidden="true"></span>
    <p class="tb-sous">Votre profil, votre mot de passe, l&rsquo;apparence du site et votre session.</p>

    <div class="param-grille">
      <section class="page-bloc !mt-0">
        <h2 class="page-bloc__titre">Mon profil</h2>
        <dl class="param-liste">
          <div><dt>R&ocirc;le</dt><dd>{{ role }}</dd></div>
          <div><dt>Lieu de culte</dt><dd>{{ lieu }}</dd></div>
        </dl>
        <form class="par-form" @submit.prevent="enregistrerNom">
          <label>Nom complet
            <input v-model="nomForm" v-saisie="NOM" class="champ" required maxlength="60" autocomplete="name" />
          </label>
          <div class="param-actions"><button type="submit" class="admin__btn">Enregistrer le nom</button></div>
          <p v-if="msgProfil" class="par-msg" role="status">{{ msgProfil }}</p>
          <p v-if="erreurProfil" class="par-erreur" role="alert">{{ erreurProfil }}</p>
        </form>
      </section>

      <section class="page-bloc !mt-0">
        <h2 class="page-bloc__titre">Mot de passe</h2>
        <p class="fiche__texte">Indiquez l&rsquo;ancien mot de passe pour en choisir un nouveau. En cas d&rsquo;oubli, l&rsquo;administrateur global le r&eacute;initialise.</p>
        <form class="par-form" @submit.prevent="changerMdp">
          <label>Ancien mot de passe
            <input v-model="mdp.ancien" type="password" required autocomplete="current-password" class="champ" />
          </label>
          <label>Nouveau mot de passe (4 caract&egrave;res minimum)
            <input v-model="mdp.nouveau" type="password" required minlength="4" autocomplete="new-password" class="champ" />
          </label>
          <label>Confirmer le nouveau mot de passe
            <input v-model="mdp.confirmation" type="password" required minlength="4" autocomplete="new-password" class="champ" />
          </label>
          <div class="param-actions"><button type="submit" class="admin__btn">Changer le mot de passe</button></div>
          <p v-if="msgMdp" class="par-msg" role="status">{{ msgMdp }}</p>
          <p v-if="erreurMdp" class="par-erreur" role="alert">{{ erreurMdp }}</p>
        </form>
      </section>

      <section class="page-bloc !mt-0">
        <h2 class="page-bloc__titre">Apparence</h2>
        <p class="fiche__texte">Le choix est m&eacute;moris&eacute; dans ce navigateur et s&rsquo;applique aussi au site public.</p>
        <div class="param-actions">
          <div class="seg" role="tablist" aria-label="Th&egrave;me">
            <button type="button" role="tab" :aria-selected="!estSombre" class="seg__bouton" :class="{ [ACTIF]: !estSombre }" @click="appliquerTheme(false)">Clair</button>
            <button type="button" role="tab" :aria-selected="estSombre" class="seg__bouton" :class="{ [ACTIF]: estSombre }" @click="appliquerTheme(true)">Sombre</button>
          </div>
        </div>
      </section>

      <section v-if="auth.isAdminGlobal" class="page-bloc !mt-0 param-bloc-large">
        <h2 class="page-bloc__titre">Page &Agrave; propos</h2>
        <p class="fiche__texte">Ces textes s&rsquo;affichent sur la page publique &laquo; &Agrave; propos &raquo;. Un champ vid&eacute; reprend le texte d&rsquo;origine.</p>
        <form class="par-form" @submit.prevent="enregistrerPage">
          <label>Titre de la page
            <input v-model="page.titre" class="champ" maxlength="120" />
          </label>
          <label>Sous-titre
            <input v-model="page.sous" class="champ" maxlength="240" />
          </label>
          <label>Titre du texte d&rsquo;introduction
            <input v-model="page.introTitre" class="champ" maxlength="120" />
          </label>
          <label>Texte d&rsquo;introduction
            <textarea v-model="page.intro" class="champ" rows="5" maxlength="900"></textarea>
          </label>
          <div class="param-actions">
            <button type="submit" class="admin__btn">Enregistrer la page</button>
            <button type="button" class="admin__btn" @click="retablirPage">R&eacute;tablir le texte d&rsquo;origine</button>
            <RouterLink to="/a-propos" class="admin__btn">Voir la page</RouterLink>
          </div>
          <p v-if="msgPage" class="par-msg" role="status">{{ msgPage }}</p>
        </form>
      </section>

      <section class="page-bloc !mt-0">
        <h2 class="page-bloc__titre">Session</h2>
        <p class="fiche__texte">Vous quittez l&rsquo;espace administrateur et revenez au site public.</p>
        <div class="param-actions">
          <button type="button" class="admin__btn btn-deconnexion" @click="quitter">Se d&eacute;connecter</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/auth"
import { useServantsStore } from "@/stores/servants"
import { useUsersStore } from "@/stores/users"
import { useAProposStore } from "@/stores/apropos"
import { estSombre, appliquerTheme } from "@/utils/theme"
import { vSaisie, verifierNom } from "@/utils/saisie"

const NOM = "nom"
const ACTIF = "seg__bouton--actif"
const auth = useAuthStore()
const store = useServantsStore()
const users = useUsersStore()
const ap = useAProposStore()
const router = useRouter()

const role = computed(() => (auth.isAdminGlobal ? "Administrateur" : "Responsable de lieu de culte"))
const lieu = computed(() => (auth.user?.lieu ? store.nomLieu(auth.user.lieu) : "Tous les lieux"))

const nomForm = ref(auth.user?.nom || "")
const msgProfil = ref("")
const erreurProfil = ref("")
const mdp = reactive({ ancien: "", nouveau: "", confirmation: "" })
const msgMdp = ref("")
const erreurMdp = ref("")
const page = reactive({ titre: ap.titre, sous: ap.sous, introTitre: ap.introTitre, intro: ap.intro })
const msgPage = ref("")

function notifier(r, t) {
  r.value = t
  setTimeout(() => { r.value = "" }, 3500)
}

function enregistrerNom() {
  erreurProfil.value = ""
  const e = verifierNom(nomForm.value, "Nom complet")
  if (e) { erreurProfil.value = e; return }
  try {
    const nom = nomForm.value.trim()
    users.changerNom(auth.user.id, nom)
    auth.majNom(nom)
    nomForm.value = nom
    notifier(msgProfil, "Nom mis \u00e0 jour.")
  } catch (err) {
    erreurProfil.value = err.message
  }
}

function changerMdp() {
  erreurMdp.value = ""
  if (mdp.nouveau !== mdp.confirmation) { erreurMdp.value = "La confirmation ne correspond pas au nouveau mot de passe."; return }
  try {
    users.changerMotDePasse(auth.user.id, mdp.ancien, mdp.nouveau)
    mdp.ancien = ""
    mdp.nouveau = ""
    mdp.confirmation = ""
    notifier(msgMdp, "Mot de passe modifi\u00e9.")
  } catch (err) {
    erreurMdp.value = err.message
  }
}

function enregistrerPage() {
  ap.enregistrer({ ...page })
  notifier(msgPage, "Page \u00c0 propos mise \u00e0 jour.")
}
function retablirPage() {
  ap.retablir()
  Object.assign(page, { titre: ap.titre, sous: ap.sous, introTitre: ap.introTitre, intro: ap.intro })
  notifier(msgPage, "Texte d\u2019origine r\u00e9tabli.")
}

function quitter() {
  auth.logout()
  router.push({ name: "accueil" })
}
</script>
