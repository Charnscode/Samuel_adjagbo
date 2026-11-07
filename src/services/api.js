import http from './http'
import { USE_MOCK, PUBLIC } from '@/config'
import { SERVANTS, ACTIVITES } from './mock'
import { useServantsStore } from '@/stores/servants'
import { useSanctionsStore } from '@/stores/sanctions'
import { useEvenementsStore, statutEvenement } from '@/stores/evenements'
import { flouterPhoto } from '@/utils/flou'
const wait = (data) => new Promise((r) => setTimeout(() => r(structuredClone(data)), 250))

// Mode mock : les compteurs, classements et présences sont lus dans le store des servants (source unique).
// Une semaine compte comme absente dès qu'un jour est absent (a) ou excusé (e).
const presentSemaine = (st) => !st.jours.includes('a') && !st.jours.includes('e')

/** Simulation (mode mock seulement) : messes du samedi (semaine) et du dimanche. Concue par coherence, a valider. */
const isoJour = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const moisCourant = () => isoJour(new Date()).slice(0, 7)

function simulerMesses(debut, fin) {
  const aujourdhui = isoJour(new Date())
  const cap = fin < aujourdhui ? fin : aujourdhui
  const compteur = {}
  const dates = []
  for (const d = new Date(`${debut.slice(0, 7)}-01T00:00:00`); isoJour(d) <= cap; d.setDate(d.getDate() + 1)) {
    const j = d.getDay()
    if (j !== 6 && j !== 0) continue
    const date = isoJour(d)
    const mois = date.slice(0, 7)
    compteur[mois] = compteur[mois] || 0
    dates.push({ date, type: j === 0 ? 'dimanche' : 'semaine', idx: compteur[mois] })
    compteur[mois] += 1
  }
  return dates
}

/** Mois en cours : les premieres messes portent les absences du compteur. Autres mois : regle deterministe. */
function estPresent(x, m) {
  if (m.date.slice(0, 7) === moisCourant()) return m.idx >= x.absences
  return x.absences === 0 || (x.id * 5 + Number(m.date.slice(8, 10))) % 8 !== 0
}

function historiqueMock(x, debut, fin) {
  const groupe = SERVANTS.filter((v) => v.lieu === x.lieu)
  const cumul = {}
  const absences = []
  for (const m of simulerMesses(debut, fin)) {
    const mois = m.date.slice(0, 7)
    for (const v of groupe) {
      const cle = `${mois}|${m.type}|${v.id}`
      cumul[cle] = (cumul[cle] || 0) + (estPresent(v, m) ? 1 : 0)
    }
    if (m.date < debut) continue
    if (!estPresent(x, m)) absences.push({ date: m.date, type: m.type })
  }
  return { absences: absences.reverse() }
}

/** Routes publiques : lecture seule, sans JWT. RG12 et RG13 : jamais de contact, date de naissance, photo, sanction, historique ni taux. */
export const publicApi = {
  async lieux() {
    if (!USE_MOCK) return (await http.get('/public/lieux')).data
    const s = useServantsStore()
    return wait(s.lieux.map((l) => {
      const g = s.liste.filter((x) => x.lieu === l.id && x.actif)
      return { id: l.id, nom: l.nom, type: l.type, effectif: g.length, presents: g.filter((x) => presentSemaine(s.stats(x.id))).length }
    }))
  },

  async classement(lieu, type) {
    if (!USE_MOCK) return (await http.get(`/public/lieux/${lieu}/classements/${type}`)).data
    const s = useServantsStore()
    return wait(s.classement(lieu, type).map((x) => ({
      id: x.id, rang: x.rang, nomComplet: x.nomComplet, grade: x.grade, absences: x.absences
    })))
  },

  async absences(lieu) {
    if (!USE_MOCK) return (await http.get(`/public/absences`, { params: { lieu } })).data
    const s = useServantsStore()
    return wait(s.liste.filter((x) => x.actif && (lieu === 'tous' || x.lieu === lieu)).map((x) => ({
      id: x.id, nomComplet: `${x.prenom} ${x.nom}`, grade: x.grade, absences: s.stats(x.id).absences
    })))
  },

  /** Classement de service : postes attribues par le responsable. RG13 elargi au poste : a valider avec le client. */
  async classementService(lieu, type) {
    if (!USE_MOCK) return (await http.get(`/public/lieux/${lieu}/classement-service/${type}`)).data
    const s = useServantsStore()
    const c = s.classementService(lieu, type)
    return wait({ date: c.date, lignes: c.lignes.map((x) => ({ posteId: x.posteId, poste: x.poste, nomComplet: x.nomComplet, grade: x.grade })) })
  },

  /** Evenements en cours et a venir (RG12 : jamais de contact ni de responsable). */
  async evenements() {
    if (!USE_MOCK) return (await http.get("/public/evenements")).data
    const ev = useEvenementsStore()
    const s = useServantsStore()
    const actifs = ev.liste.filter((e) => statutEvenement(e) !== "termine")
    actifs.sort((a, b) => (a.dateDebut + (a.heureDebut || "")).localeCompare(b.dateDebut + (b.heureDebut || "")))
    return wait(actifs.map((e) => ({
      id: e.id, titre: e.titre, type: e.type, statut: statutEvenement(e), lieu: e.lieu === "tous" ? "Tous les lieux" : s.nomLieu(e.lieu),
      dateDebut: e.dateDebut, heureDebut: e.heureDebut, dateFin: e.dateFin, heureFin: e.heureFin,
      lieuPrecis: e.lieuPrecis, description: e.description, consignes: e.consignes, concernes: e.concernes, image: e.image || null
    })))
  },
  /** Liste publique des servants actifs. RG13 : nom, grade, lieu, code couleur seulement. */
  async servants() {
    if (!USE_MOCK) return (await http.get("/public/servants")).data
    const s = useServantsStore()
    const l = s.liste.filter((x) => x.actif).map((x) => ({
      id: x.id, nomComplet: `${x.prenom} ${x.nom}`, grade: x.grade, lieuId: x.lieu, lieu: s.nomLieu(x.lieu), absences: s.stats(x.id).absences
    }))
    l.sort((a, b) => a.nomComplet.localeCompare(b.nomComplet))
    return wait(l)
  },

  /** Historique public d un servant sur une periode : postes attribues et absences datees (simule, pas encore relie aux seances). */
  async servantHistorique(id, debut, fin) {
    if (!USE_MOCK) return (await http.get(`/public/servants/${id}/historique`, { params: { debut, fin } })).data
    const x = SERVANTS.find((v) => v.id === Number(id))
    if (!x) return wait(null)
    const h = historiqueMock(x, debut, fin)
    const st = useServantsStore()
    const postes = st.postesDe(x.id).filter((p) => p.date >= debut && p.date <= fin).sort((a, b) => b.date.localeCompare(a.date))
    return wait({ postes, absences: h.absences })
  },
  async servant(id) {
    if (!USE_MOCK) return (await http.get(`/public/servants/${id}`)).data
    const s = useServantsStore()
    const x = s.liste.find((v) => v.id === Number(id))
    if (!x || !x.actif) return wait(null)
    const g = s.liste.filter((v) => v.lieu === x.lieu && v.actif)
    const lieu = s.lieux.find((l) => l.id === x.lieu)
    return wait({
      id: x.id, nomComplet: `${x.prenom} ${x.nom}`, grade: x.grade,
      lieu: lieu.nom, lieuType: lieu.type, effectif: g.length, absences: s.stats(x.id).absences,
      posteSemaine: s.posteDe(x.id, x.lieu, 'semaine'), posteDimanche: s.posteDe(x.id, x.lieu, 'dimanche'), photo: PUBLIC.photos ? (PUBLIC.photosFloutees ? await flouterPhoto(x.photo) : x.photo || null) : null
    })
  }
}

/** Fil de notifications d un enfant (mock) : evenements, presences, absences, postes. Le back devra fournir le meme format. Concu par coherence, a valider. */
const dateLongue = (iso) => new Date(`${String(iso).slice(0, 10)}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
const LIBELLE_SEANCE = { dimanche: 'messe du dimanche', semaine: 'messe de la semaine', reunion: 'r\u00e9union du samedi' }
const LIBELLE_STATUT = { present: 'Pr\u00e9sent', absent: 'Absent', permission: 'Permissionn\u00e9' }
function notificationsParent(x, s, concernes) {
  const liste = []
  for (const e of concernes.slice(0, 4)) {
    liste.push({ id: `ev-${e.id}`, kind: 'evenement', date: e.dateDebut, texte: `Nouvel \u00e9v\u00e9nement : ${e.titre}, le ${dateLongue(e.dateDebut)}.` })
  }
  const abs = s.stats(x.id).absences
  if (abs) liste.push({ id: `abs-${abs}`, kind: 'absence', date: isoJour(new Date()), texte: `${x.prenom} compte ${abs} absence${abs > 1 ? 's' : ''} ce mois-ci.` })
  s.presencesDe(x.id).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).forEach((p) => {
    liste.push({
      id: `pr-${p.type}-${p.date}`, kind: p.statut === 'absent' ? 'absence' : 'presence', date: p.date,
      texte: `Pr\u00e9sence du ${dateLongue(p.date)} (${LIBELLE_SEANCE[p.type] || p.type}) : ${x.prenom}, statut \u00ab ${LIBELLE_STATUT[p.statut] || p.statut} \u00bb.`
    })
  })
  s.postesDe(x.id).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 2).forEach((p) => {
    liste.push({ id: `po-${p.type}-${p.date}`, kind: 'poste', date: p.date, texte: `Poste attribu\u00e9 pour la ${LIBELLE_SEANCE[p.type] || p.type} du ${dateLongue(p.date)} : ${p.poste}.` })
  })
  return liste.sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 12)
}

/** Espace parent : compte cree par l administrateur, uniquement les enfants rattaches. Photo nette autorisee ici. */
export const parentApi = {
  async mesEnfants(user) {
    if (!USE_MOCK) return (await http.get("/parent/enfants")).data
    const s = useServantsStore()
    const ev = useEvenementsStore()
    const ids = (user && user.enfants) || []
    const sa = useSanctionsStore()
    const actifs = ev.liste.filter((e) => statutEvenement(e) !== "termine")
    const enfants = ids.map((id) => s.liste.find((x) => x.id === id)).filter((x) => x && x.actif)
    return wait(enfants.map((x) => {
      const g = s.liste.filter((v) => v.lieu === x.lieu && v.actif)
      const lieu = s.lieux.find((l) => l.id === x.lieu)
      const concernes = actifs.filter((e) => (e.lieu === "tous" || e.lieu === x.lieu) && (e.concernes === "tous" || e.concernes === x.grade))
      return {
        id: x.id, nomComplet: `${x.prenom} ${x.nom}`, grade: x.grade, lieu: lieu ? lieu.nom : x.lieu, lieuType: lieu ? lieu.type : "",
        effectif: g.length, absences: s.stats(x.id).absences, notifications: notificationsParent(x, s, concernes), posteSemaine: s.posteDe(x.id, x.lieu, "semaine"), posteDimanche: s.posteDe(x.id, x.lieu, "dimanche"), photo: x.photo || null,
        contact: x.contact || "", dateNaissance: x.dateNaissance || "",
        sanctions: sa.liste.filter((z) => z.servantId === x.id).map((z) => ({ id: z.id, motif: z.motif, date: z.date, statut: z.statut, dateLevee: z.dateLevee || null })).sort((a, b) => b.date.localeCompare(a.date)),
        evenements: concernes.map((e) => ({
          id: e.id, titre: e.titre, type: e.type, statut: statutEvenement(e), lieu: e.lieu === "tous" ? "Tous les lieux" : s.nomLieu(e.lieu),
          dateDebut: e.dateDebut, heureDebut: e.heureDebut, dateFin: e.dateFin, heureFin: e.heureFin,
          lieuPrecis: e.lieuPrecis, description: e.description, consignes: e.consignes, image: e.image || null
        }))
      }
    }))
  }
}

/** Routes protégées (JWT). Un responsable ne voit que son lieu ; l'admin global voit tout. */
export const adminApi = {
  async dashboard(user) {
    if (!USE_MOCK) return (await http.get('/admin/dashboard')).data
    const s = useServantsStore()
    const sanctions = useSanctionsStore()
    const portee = (l) => user.role === 'admin_global' || l === user.lieu
    const servants = s.liste.filter((x) => x.actif && portee(x.lieu))
    const st = servants.map((x) => s.stats(x.id))
    const presences = st.reduce((n, v) => n + v.semaine + v.dimanche, 0)
    const absences = st.reduce((n, v) => n + v.absences, 0)
    const lieuDe = (servantId) => s.liste.find((x) => x.id === servantId)?.lieu
    return wait({
      lieux: s.lieux.filter((l) => portee(l.id)).length,
      servants: servants.length,
      presents: st.filter(presentSemaine).length,
      absents: st.filter((v) => !presentSemaine(v)).length,
      assiduite: Math.round((presences / ((presences + absences) || 1)) * 100),
      sanctions: sanctions.liste.filter((x) => x.statut === 'active' && portee(lieuDe(x.servantId))).length,
      repartition: s.lieux.filter((l) => portee(l.id)).map((l) => ({
        id: l.id, nom: l.nom, total: servants.filter((x) => x.lieu === l.id).length
      })),
      activites: ACTIVITES.filter((a) => portee(a.lieu))
    })
  }
}
