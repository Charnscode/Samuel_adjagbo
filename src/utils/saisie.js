// Source unique des regles de saisie (lot 24). Concu par coherence, a valider.
// Le front restreint et verifie ; le back devra refaire les memes controles (couture back).
export const LIMITES = { nom: 60, telephone: 20, email: 254, identifiant: 30, motif: 300 }

export function nettoyer(type, valeur) {
  let v = String(valeur === null || valeur === undefined ? "" : valeur)
  v = v.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "")
  if (type === "nom") {
    v = v.replace(/[^\p{L}\p{M}0-9 .\-\u0027\u2019]/gu, "").replace(/ {2,}/g, " ").replace(/^[ .\-\u0027\u2019]+/, "")
  } else if (type === "telephone") {
    v = v.replace(/[^0-9+ ]/g, "").replace(/(?!^)\+/g, "").replace(/ {2,}/g, " ").replace(/^ +/, "")
  } else if (type === "email") {
    v = v.toLowerCase().replace(/[^a-z0-9@._+\-]/g, "")
    const i = v.indexOf("@")
    if (i >= 0) v = v.slice(0, i + 1) + v.slice(i + 1).replace(/@/g, "")
  } else if (type === "identifiant") {
    v = v.replace(/[^A-Za-z0-9._\-]/g, "")
  } else if (type === "motif") {
    v = v.replace(/[<>]/g, "").replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").replace(/^\s+/, "")
  }
  const max = LIMITES[type]
  return max ? v.slice(0, max) : v
}

export function verifierNom(valeur, etiquette) {
  const v = String(valeur || "").trim()
  const lettres = (v.match(/\p{L}/gu) || []).length
  if (lettres < 2) return `${etiquette} : au moins 2 lettres, pas uniquement des chiffres.`
  if (v.length > LIMITES.nom) return `${etiquette} : ${LIMITES.nom} caract\u00e8res au maximum.`
  return ""
}

export function verifierTelephone(valeur) {
  const v = String(valeur || "").trim()
  if (!/^\+?[0-9]+( [0-9]+)*$/.test(v)) return "T\u00e9l\u00e9phone : chiffres seulement (espaces et + au d\u00e9but autoris\u00e9s)."
  const n = v.replace(/\D/g, "").length
  if (n < 8 || n > 15) return "T\u00e9l\u00e9phone : entre 8 et 15 chiffres."
  return ""
}

export function verifierEmail(valeur) {
  const v = String(valeur || "").trim()
  if (v.length > LIMITES.email || v.includes("..") || !/^[a-z0-9._+\-]+@[a-z0-9\-]+(\.[a-z0-9\-]+)+$/.test(v)) return "Adresse e-mail invalide."
  return ""
}

export function verifierIdentifiant(valeur) {
  const v = String(valeur || "").trim()
  if (!/^[A-Za-z0-9][A-Za-z0-9._\-]{2,29}$/.test(v)) return "Identifiant : 3 \u00e0 30 caract\u00e8res (lettres, chiffres, point, tiret)."
  return ""
}

export function verifierMotif(valeur) {
  const v = String(valeur || "").trim()
  const lettres = (v.match(/\p{L}/gu) || []).length
  if (lettres < 3) return "Motif : au moins 3 lettres."
  if (v.length > LIMITES.motif) return `Motif : ${LIMITES.motif} caract\u00e8res au maximum.`
  return ""
}

export function verifierDateNaissance(valeur) {
  const v = String(valeur || "")
  const d = new Date(`${v}T00:00:00`)
  if (!v || Number.isNaN(d.getTime())) return "Date de naissance invalide."
  if (d > new Date()) return "Date de naissance : ne peut pas \u00eatre dans le futur."
  if (d.getFullYear() < 1950) return "Date de naissance trop ancienne."
  return ""
}

// Directive v-saisie="type" : restreint la saisie en direct (frappe et collage).
const REGLES = {
  nom: { inputmode: "text" },
  telephone: { inputmode: "tel" },
  email: { inputmode: "email" },
  identifiant: { inputmode: "text" },
  motif: {}
}
export const vSaisie = {
  mounted(el, binding) {
    const type = binding.value
    const r = REGLES[type]
    if (!r) return
    if (r.inputmode) el.setAttribute("inputmode", r.inputmode)
    el.setAttribute("maxlength", String(LIMITES[type]))
    const appliquer = () => {
      if (el.dataset.composition === "1") return
      const propre = nettoyer(type, el.value)
      if (propre !== el.value) {
        el.value = propre
        el.dispatchEvent(new Event("input", { bubbles: true }))
      }
    }
    el.addEventListener("input", appliquer)
    el.addEventListener("compositionstart", () => { el.dataset.composition = "1" })
    el.addEventListener("compositionend", () => { el.dataset.composition = "0"; appliquer() })
  }
}