<template>
  <div class="page-fond">
    <PageDeco />
    <div class="page-contenu">
      <div class="par-entete">
        <div>
          <h1 class="page-titre">Mon espace parent</h1>
          <p class="page-sous">Bonjour {{ auth.user?.nom }}. Retrouvez ici les alertes, les &eacute;v&eacute;nements et la photo de votre enfant.</p>
        </div>
        <button type="button" class="pill-gold btn-deconnexion" @click="quitter">D&eacute;connexion</button>
      </div>

      <section class="page-bloc">
        <div class="par-notif">
          <div>
            <h2 class="page-bloc__titre">Notifications du navigateur</h2>
            <p class="fiche__texte">{{ texteNotif }}</p>
          </div>
          <button v-if="peutActiver" type="button" class="pill-gold" @click="activer">Activer</button>
        </div>
      </section>

      <section v-if="flux.length" class="page-bloc" aria-labelledby="par-flux-titre">
        <h2 id="par-flux-titre" class="page-bloc__titre">Notifications</h2>
        <p class="fiche__texte">&Eacute;v&eacute;nements, pr&eacute;sences, absences et postes de service de vos enfants.</p>
        <div class="par-liste">
          <p v-for="n in flux" :key="n.cle" :class="n.kind === 'absence' ? 'par-alerte' : 'par-info'">
            <strong v-if="enfants.length > 1">{{ n.enfant }} &middot; </strong>{{ n.texte }}
          </p>
        </div>
      </section>

      <p v-if="chargement" class="page-vide" role="status">Chargement&hellip;</p>
      <p v-else-if="!enfants.length" class="page-vide">Aucun enfant n&rsquo;est rattach&eacute; &agrave; ce compte. Contactez l&rsquo;administration de la paroisse.</p>

      <div v-else class="par-grille">
        <button v-for="e in enfants" :key="e.id" type="button" class="par-carte" aria-haspopup="dialog" @click="ouvrir(e.id)">
          <span class="par-carte__resume">
            <img v-if="e.photo" :src="e.photo" :alt="`Photo de ${e.nomComplet}`" class="par-carte__photo" />
            <span v-else class="par-carte__photo par-carte__photo--init" aria-hidden="true">{{ initiales(e.nomComplet) }}</span>
            <span class="par-carte__texte">
              <span class="par-carte__nom">{{ e.nomComplet }}</span>
              <span class="par-carte__sous">{{ e.grade }} &middot; {{ e.lieu }}</span>
            </span>
            <AbsenceBadge :absences="e.absences" />
          </span>
          <span class="par-carte__rangs">
            <span>Messe de la semaine : <strong>{{ e.posteSemaine || "Non attribu&eacute;" }}</strong></span>
            <span>Messe du dimanche : <strong>{{ e.posteDimanche || "Non attribu&eacute;" }}</strong></span>
          </span>
          <span class="par-carte__voir">Voir le d&eacute;tail &rarr;</span>
        </button>
      </div>

      <Teleport to="body">
        <div v-if="enfantOuvert" class="par-modal" @click.self="fermer">
          <div class="par-modal__boite" role="dialog" aria-modal="true" aria-labelledby="par-modal-titre">
            <header class="par-modal__tete">
              <img v-if="enfantOuvert.photo" :src="enfantOuvert.photo" :alt="`Photo de ${enfantOuvert.nomComplet}`" class="par-carte__photo" />
              <span v-else class="par-carte__photo par-carte__photo--init" aria-hidden="true">{{ initiales(enfantOuvert.nomComplet) }}</span>
              <div>
                <h2 id="par-modal-titre" class="par-modal__titre">{{ enfantOuvert.nomComplet }}</h2>
                <p class="par-modal__sous">{{ enfantOuvert.grade }} &middot; {{ enfantOuvert.lieu }}</p>
                <AbsenceBadge :absences="enfantOuvert.absences" />
              </div>
              <button ref="btnFermer" type="button" class="par-modal__fermer" aria-label="Fermer la fen&ecirc;tre" @click="fermer">&times;</button>
            </header>
            <div class="par-modal__corps">
              <div class="par-modal__duo">
                <div>
                  <h3>Classement</h3>
                  <p>Messe de la semaine : <strong>{{ enfantOuvert.posteSemaine || "Non attribu&eacute;" }}</strong></p>
                  <p>Messe du dimanche : <strong>{{ enfantOuvert.posteDimanche || "Non attribu&eacute;" }}</strong></p>
                </div>
                <div>
                  <h3>Coordonn&eacute;es</h3>
                  <p><strong>Contact :</strong> {{ enfantOuvert.contact || "Non renseign\u00e9" }}</p>
                  <p><strong>Date de naissance :</strong> {{ dateFr(enfantOuvert.dateNaissance) || "Non renseign\u00e9e" }}</p>
                </div>
              </div>

              <div>
                <h3>Alertes</h3>
                <div v-if="alertes(enfantOuvert).length" class="par-liste">
                  <p v-for="a in alertes(enfantOuvert)" :key="a.id" class="par-alerte">{{ a.texte }}</p>
                </div>
                <p v-else>Aucune alerte pour le moment.</p>
              </div>

              <div>
                <h3>Sanctions</h3>
                <ul v-if="enfantOuvert.sanctions.length" class="par-sanctions">
                  <li v-for="s in enfantOuvert.sanctions" :key="s.id" :class="classeSanction(s)">
                    <span class="par-sanction__statut">{{ libelleStatut(s) }}</span>
                    <span class="par-sanction__motif">{{ s.motif }}</span>
                    <small>{{ dateFr(s.date) }}<span v-if="s.dateLevee"> &middot; lev&eacute;e le {{ dateFr(s.dateLevee) }}</span></small>
                  </li>
                </ul>
                <p v-else>Aucune sanction enregistr&eacute;e.</p>
              </div>

              <div>
                <h3>&Eacute;v&eacute;nements concernant cet enfant</h3>
                <div v-if="enfantOuvert.evenements.length" class="ev-grille">
                  <article v-for="v in enfantOuvert.evenements" :key="v.id" class="ev-carte">
                    <img v-if="v.image" :src="v.image" alt="" class="ev-carte__image" />
                    <div class="ev-carte__corps">
                      <span class="ev-carte__type">{{ v.type }}<span v-if="estEnCours(v)" class="ev-carte__live">En cours</span></span>
                      <span class="ev-carte__titre">{{ v.titre }}</span>
                      <span class="ev-carte__date">{{ libellePeriode(v) }} &middot; {{ v.lieu }}</span>
                    </div>
                    <div v-if="v.lieuPrecis || v.description || v.consignes" class="ev-carte__detail">
                      <p v-if="v.lieuPrecis"><strong>Lieu :</strong> {{ v.lieuPrecis }}</p>
                      <p v-if="v.description">{{ v.description }}</p>
                      <p v-if="v.consignes"><strong>Consignes :</strong> {{ v.consignes }}</p>
                    </div>
                  </article>
                </div>
                <p v-else>Aucun &eacute;v&eacute;nement &agrave; venir pour le moment.</p>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/auth"
import { parentApi } from "@/services/api"
import { libellePeriode } from "@/stores/evenements"
import AbsenceBadge from "@/components/AbsenceBadge.vue"
import PageDeco from "@/components/PageDeco.vue"

const auth = useAuthStore()
const router = useRouter()
const enfants = ref([])
const chargement = ref(true)
const notifEtat = ref("default")
const enfantOuvertId = ref(null)
const btnFermer = ref(null)
const peutActiver = computed(() => notifEtat.value === "default")
const flux = computed(() => enfants.value
  .flatMap((e) => (e.notifications || []).map((n) => ({ ...n, cle: `${e.id}-${n.id}`, enfant: e.nomComplet })))
  .sort((a, b) => String(b.date).localeCompare(String(a.date)))
  .slice(0, 12))
const enfantOuvert = computed(() => enfants.value.find((e) => e.id === enfantOuvertId.value) || null)

const initiales = (nom) => nom.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase()
const dateFr = (iso) => (iso ? new Date(`${String(iso).slice(0, 10)}T00:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "")
const estEnCours = (v) => v.statut === "en_cours"
const libelleStatut = (s) => (s.statut === "active" ? "Active" : "Lev\u00e9e")
const classeSanction = (s) => (s.statut === "active" ? "par-sanction par-sanction--active" : "par-sanction")

function ouvrir(id) {
  enfantOuvertId.value = id
  document.body.style.overflow = "hidden"
  nextTick(() => { if (btnFermer.value) btnFermer.value.focus() })
}
function fermer() {
  enfantOuvertId.value = null
  document.body.style.overflow = ""
}
function surEchap(ev) {
  if (ev.key === "Escape" && enfantOuvertId.value !== null) fermer()
}

const texteNotif = computed(() => {
  if (notifEtat.value === "granted") return "Activ\u00e9es. Vous recevrez les alertes et les nouveaux \u00e9v\u00e9nements concernant votre enfant tant que cette page est ouverte. Les envois par SMS ou WhatsApp d\u00e9pendront du serveur."
  if (notifEtat.value === "denied") return "Bloqu\u00e9es dans votre navigateur. Autorisez-les dans les r\u00e9glages du site pour les recevoir."
  if (notifEtat.value === "indisponible") return "Votre navigateur ne g\u00e8re pas les notifications. Les alertes restent visibles sur cette page."
  return "Activez-les pour \u00eatre pr\u00e9venu des absences de votre enfant et des \u00e9v\u00e9nements qui le concernent."
})

function alertes(e) {
  if (!e.absences) return []
  return [{ id: `abs-${e.id}-${e.absences}`, texte: `${e.nomComplet} compte ${e.absences} absence${e.absences > 1 ? "s" : ""} ce mois-ci.` }]
}

const cleVues = () => `servants-alertes-vues-${auth.user?.id}`
function lireVues() {
  try {
    return JSON.parse(localStorage.getItem(cleVues()) || "[]")
  } catch (err) {
    return []
  }
}
function sauverVues(l) {
  try {
    localStorage.setItem(cleVues(), JSON.stringify(l))
  } catch (err) {
    // stockage indisponible : les alertes pourront etre renotifiees
  }
}

function notifierNouveautes() {
  if (notifEtat.value !== "granted") return
  const vues = lireVues()
  const nouvelles = []
  for (const e of enfants.value) {
    for (const n of e.notifications || []) { const id = `nt-${e.id}-${n.id}`; if (n.kind !== "evenement" && !vues.includes(id)) nouvelles.push({ id, texte: n.texte }) }
    for (const v of e.evenements) {
      const id = `ev-${v.id}-${e.id}`
      if (!vues.includes(id)) nouvelles.push({ id, texte: `Nouvel \u00e9v\u00e9nement pour ${e.nomComplet} : ${v.titre}` })
    }
  }
  for (const n of nouvelles.slice(0, 5)) {
    try {
      new Notification("Servants de Messe", { body: n.texte })
    } catch (err) {
      // notification refusee par le navigateur
    }
  }
  sauverVues([...vues, ...nouvelles.map((n) => n.id)])
}

async function activer() {
  if (typeof Notification === "undefined") return
  notifEtat.value = await Notification.requestPermission()
  notifierNouveautes()
}

async function quitter() {
  fermer()
  await router.push({ name: "accueil" })
  await nextTick()
  auth.logout()
}

onMounted(async () => {
  window.addEventListener("keydown", surEchap)
  notifEtat.value = typeof Notification === "undefined" ? "indisponible" : Notification.permission
  enfants.value = await parentApi.mesEnfants(auth.user)
  chargement.value = false
  notifierNouveautes()
})
onBeforeUnmount(() => {
  window.removeEventListener("keydown", surEchap)
  document.body.style.overflow = ""
})
</script>
