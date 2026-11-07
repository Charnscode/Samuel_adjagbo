import { defineStore } from "pinia"
import { GRADES } from '@/utils/grades'

// Evenements : mode mock seulement (couture back). Conserves dans localStorage, aucune donnee inventee.
export const TYPES_EVENEMENT = ["Messe", "F\u00eate", "Retraite", "Formation", "R\u00e9union", "Sortie", "Autre"]
export const PUBLICS = [
  { id: "tous", label: "Tous les servants" },
  ...GRADES.map((g) => ({ id: g, label: g }))
]

const CLE = "servants-evenements"
function lire() {
  try {
    const v = JSON.parse(localStorage.getItem(CLE) || "[]")
    return Array.isArray(v) ? v : []
  } catch (err) {
    return []
  }
}
function sauver(liste) {
  try {
    localStorage.setItem(CLE, JSON.stringify(liste))
  } catch (err) {
    // stockage indisponible : les evenements restent en memoire
  }
}

const pad = (n) => String(n).padStart(2, "0")
const isoJour = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const maintenant = () => { const d = new Date(); return `${isoJour(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}` }
export const debutDe = (e) => `${e.dateDebut}T${e.heureDebut || "00:00"}`
export const finDe = (e) => `${e.dateFin || e.dateDebut}T${e.heureFin || "23:59"}`

/** termine | en_cours | a_venir */
export function statutEvenement(e) {
  const n = maintenant()
  if (finDe(e) < n) return "termine"
  if (debutDe(e) <= n) return "en_cours"
  return "a_venir"
}

const jourLong = (d) => new Date(`${d}T00:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
export function libellePeriode(e) {
  const fin = e.dateFin || e.dateDebut
  const h = (x) => (x ? ` \u00e0 ${x}` : "")
  if (fin === e.dateDebut) return jourLong(e.dateDebut) + h(e.heureDebut)
  return `Du ${jourLong(e.dateDebut)}${h(e.heureDebut)} au ${jourLong(fin)}${h(e.heureFin)}`
}

function nettoyer(d) {
  const titre = String(d.titre || "").trim()
  if (!titre) throw new Error("Le titre est obligatoire.")
  if (!d.dateDebut) throw new Error("La date de d\u00e9but est obligatoire.")
  const t = (x) => String(x || "").trim()
  const e = {
    titre, type: d.type || "Autre", lieu: d.lieu || "tous",
    dateDebut: d.dateDebut, heureDebut: d.heureDebut || "",
    dateFin: d.dateFin || d.dateDebut, heureFin: d.heureFin || "",
    lieuPrecis: t(d.lieuPrecis), description: t(d.description), consignes: t(d.consignes),
    concernes: d.concernes || "tous", responsable: t(d.responsable), contact: t(d.contact), image: d.image || null
  }
  if (finDe(e) < debutDe(e)) throw new Error("La fin doit \u00eatre apr\u00e8s le d\u00e9but.")
  return e
}

export const useEvenementsStore = defineStore("evenements", {
  state: () => ({ liste: lire() }),
  actions: {
    ajouter(data) {
      const e = nettoyer(data)
      const id = Math.max(0, ...this.liste.map((x) => x.id)) + 1
      this.liste.push({ id, ...e })
      sauver(this.liste)
    },
    modifier(id, data) {
      const e = nettoyer(data)
      const cible = this.liste.find((x) => x.id === id)
      if (!cible) throw new Error("\u00c9v\u00e9nement introuvable.")
      Object.assign(cible, e)
      sauver(this.liste)
    },
    supprimer(id) {
      this.liste = this.liste.filter((x) => x.id !== id)
      sauver(this.liste)
    }
  }
})
