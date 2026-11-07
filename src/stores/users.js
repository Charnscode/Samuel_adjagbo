import { defineStore } from "pinia"

// Comptes de demonstration (mode mock seulement, couture back). Ids 1 a 5 reserves.
// Le compte parent de demonstration est concu par coherence : il est rattache aux servants 1 et 3.
const DEMOS = [
  { id: 1, nom: "Admin Global", identifiant: "admin", motDePasse: "admin", role: "admin_global", lieu: null },
  { id: 2, nom: "Responsable D\u00f4me", identifiant: "dome", motDePasse: "dome", role: "responsable_lieu", lieu: "dome" },
  { id: 3, nom: "Responsable Adjagbo", identifiant: "adjagbo", motDePasse: "adjagbo", role: "responsable_lieu", lieu: "adjagbo" },
  { id: 4, nom: "Responsable Ayimlonfid\u00e9", identifiant: "ayimlonfide", motDePasse: "ayimlonfide", role: "responsable_lieu", lieu: "ayimlonfide" },
  { id: 5, nom: "Parent de d\u00e9monstration", identifiant: "parent", motDePasse: "parent", role: "parent", lieu: null, enfants: [1, 3] }
]

const CLE = "servants-comptes"
function lireStock() {
  try {
    const v = JSON.parse(localStorage.getItem(CLE) || "[]")
    return Array.isArray(v) ? v.filter((x) => x && typeof x.id === "number") : []
  } catch (err) {
    return []
  }
}
// Les comptes de demonstration gardent leurs modifications ; les comptes crees s ajoutent.
function fusion() {
  const stock = lireStock()
  const demos = DEMOS.map((d) => ({ ...d, ...(stock.find((x) => x.id === d.id) || {}) }))
  const extras = stock.filter((x) => x.id > 5)
  return [...demos, ...extras]
}
function sauver(liste) {
  try {
    localStorage.setItem(CLE, JSON.stringify(liste))
  } catch (err) {
    // stockage indisponible : les comptes restent en memoire
  }
}

export const useUsersStore = defineStore("users", {
  state: () => ({ liste: fusion() }),
  actions: {
    // Comptes crees par l administrateur global : responsables de lieu et parents.
    ajouter({ nom, identifiant, motDePasse, role = "responsable_lieu", lieu = null, enfants = [] }) {
      if (this.liste.some((x) => x.identifiant === identifiant)) throw new Error("Cet identifiant est d\u00e9j\u00e0 utilis\u00e9.")
      if (role === "parent" && !enfants.length) throw new Error("Choisissez au moins un enfant.")
      if (role !== "parent" && !lieu) throw new Error("Choisissez un lieu de culte.")
      const id = Math.max(5, ...this.liste.map((x) => x.id)) + 1
      if (role === "parent") this.liste.push({ id, nom, identifiant, motDePasse, role, lieu: null, enfants: [...enfants] })
      else this.liste.push({ id, nom, identifiant, motDePasse, role, lieu })
      sauver(this.liste)
    },
    modifier(id, { nom, identifiant, lieu, enfants }) {
      if (this.liste.some((x) => x.id !== id && x.identifiant === identifiant)) throw new Error("Cet identifiant est d\u00e9j\u00e0 utilis\u00e9.")
      const cible = this.liste.find((x) => x.id === id)
      if (cible.role === "parent") {
        if (!enfants || !enfants.length) throw new Error("Choisissez au moins un enfant.")
        Object.assign(cible, { nom, identifiant, enfants: [...enfants] })
      } else {
        Object.assign(cible, { nom, identifiant, lieu })
      }
      sauver(this.liste)
    },
    reinitialiser(id, motDePasse) {
      this.liste.find((x) => x.id === id).motDePasse = motDePasse
      sauver(this.liste)
    },
    // Nom modifie par le titulaire lui-meme (lot 25e)
    changerNom(id, nom) {
      const cible = this.liste.find((x) => x.id === id)
      if (!cible) throw new Error("Compte introuvable.")
      cible.nom = nom
      sauver(this.liste)
    },
    // Mot de passe change par le titulaire : l ancien mot de passe est exige (lot 25e)
    changerMotDePasse(id, ancien, nouveau) {
      const cible = this.liste.find((x) => x.id === id)
      if (!cible) throw new Error("Compte introuvable.")
      if (cible.motDePasse !== ancien) throw new Error("L\u2019ancien mot de passe est incorrect.")
      if (!nouveau || nouveau.length < 4) throw new Error("Le nouveau mot de passe doit comporter 4 caract\u00e8res au minimum.")
      if (nouveau === ancien) throw new Error("Le nouveau mot de passe doit \u00eatre diff\u00e9rent de l\u2019ancien.")
      cible.motDePasse = nouveau
      sauver(this.liste)
    },
    supprimer(id) {
      this.liste = this.liste.filter((x) => x.id !== id)
      sauver(this.liste)
    }
  }
})
