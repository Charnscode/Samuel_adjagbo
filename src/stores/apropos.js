import { defineStore } from "pinia"

// Page A propos : contenu modifiable par l administrateur global (mode mock, couture back).
// Les valeurs par defaut reprennent le texte d origine de la page.
export const DEFAUT = {
  titre: "\u00c0 propos de la plateforme",
  sous: "Le suivi de la pr\u00e9sence des servants de messe de la paroisse d\u2019Adjagbo, ouvert \u00e0 tous en lecture seule.",
  introTitre: "Une plateforme pour la paroisse et les familles",
  intro: "Cette plateforme permet \u00e0 la paroisse d\u2019Adjagbo et \u00e0 ses stations de D\u00f4me et d\u2019Ayimlonfid\u00e9 de suivre la pr\u00e9sence des servants de messe. Les paroissiens et les parents consultent les classements et le suivi des absences sans cr\u00e9er de compte."
}

const CLE = "servants-apropos"
const t = (x, n) => String(x || "").trim().slice(0, n)
function lire() {
  try {
    const v = JSON.parse(localStorage.getItem(CLE) || "null")
    return v && typeof v === "object" ? v : {}
  } catch (err) {
    return {}
  }
}

export const useAProposStore = defineStore("apropos", {
  state: () => ({ ...DEFAUT, ...lire() }),
  actions: {
    enregistrer(d) {
      const propre = {
        titre: t(d.titre, 120) || DEFAUT.titre,
        sous: t(d.sous, 240) || DEFAUT.sous,
        introTitre: t(d.introTitre, 120) || DEFAUT.introTitre,
        intro: t(d.intro, 900) || DEFAUT.intro
      }
      Object.assign(this, propre)
      try {
        localStorage.setItem(CLE, JSON.stringify(propre))
      } catch (err) {
        // stockage indisponible : le texte reste actif pour la session
      }
    },
    retablir() { this.enregistrer(DEFAUT) }
  }
})
