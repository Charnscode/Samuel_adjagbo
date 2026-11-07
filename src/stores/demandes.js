import { defineStore } from "pinia"

// Demandes d acces des parents : mode mock seulement (couture back).
// Back a prevoir : POST /public/demandes-acces (sans compte), GET et PATCH /admin/demandes-acces (admin global seulement).
// Les coordonnees ne sont jamais renvoyees par une route publique (RG12).
const CLE = "servants-demandes"
const MAX = 200
export const LIENS = ["P\u00e8re", "M\u00e8re", "Tuteur ou tutrice", "Autre"]

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
    // stockage indisponible : les demandes restent en memoire
  }
}
const t = (x, n) => String(x || "").trim().slice(0, n)

export const useDemandesStore = defineStore("demandes", {
  state: () => ({ liste: lire() }),
  getters: {
    enAttente: (s) => s.liste.filter((x) => x.statut === "en_attente")
  },
  actions: {
    recharger() { this.liste = lire() },
    envoyer(d) {
      this.liste = lire()
      const nomParent = t(d.nomParent, 80)
      const telephone = t(d.telephone, 30)
      const enfants = (Array.isArray(d.enfants) ? d.enfants : []).slice(0, 10).map((e) => ({ id: e.id, nomComplet: t(e.nomComplet, 80), lieu: t(e.lieu, 40) }))
      if (!nomParent) throw new Error("Votre nom est obligatoire.")
      if (!telephone) throw new Error("Un num\u00e9ro de t\u00e9l\u00e9phone est obligatoire pour vous joindre.")
      if (!enfants.length) throw new Error("Choisissez au moins un enfant servant.")
      if (this.liste.length >= MAX) throw new Error("Trop de demandes en attente. R\u00e9essayez plus tard.")
      const id = Math.max(0, ...this.liste.map((x) => x.id)) + 1
      const lieux = [...new Set(enfants.map((e) => e.lieu).filter(Boolean))]
      this.liste.push({
        id, statut: "en_attente", date: new Date().toISOString(),
        nomParent, telephone, email: t(d.email, 80), lien: LIENS.includes(d.lien) ? d.lien : "Autre",
        enfants, nomEnfant: enfants.map((e) => e.nomComplet).join(", "), lieu: lieux.join(", "),
        message: t(d.message, 500)
      })
      sauver(this.liste)
    },
    traiter(id, statut) {
      this.liste = lire()
      const x = this.liste.find((y) => y.id === id)
      if (!x) return
      x.statut = statut
      x.traiteLe = new Date().toISOString()
      sauver(this.liste)
    }
  }
})
