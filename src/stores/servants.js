import { defineStore } from 'pinia'
import { SERVANTS, LIEUX } from '@/services/mock'
import { SYMBOLE, PERMISSION_COMPTE_ABSENCE } from '@/utils/presence'
import { photoRecuperable } from '@/utils/photo'

import { GRADES, POSTES, classable } from '@/utils/grades'
export { GRADES }

const CLE_STOCKAGE = 'servants-presences'
// Mode mock seulement (couture back) : les séances saisies survivent au rechargement de la page.
function lirePresences() {
  try {
    return JSON.parse(localStorage.getItem(CLE_STOCKAGE) || '{}')
  } catch (e) {
    return {}
  }
}
function sauverPresences(p) {
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(p))
  } catch (e) {
    // Stockage indisponible : les séances restent en mémoire.
  }
}
function lireJson(cle) {
  try {
    const v = JSON.parse(localStorage.getItem(cle) || '{}')
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {}
  } catch (e) {
    return {}
  }
}
function sauverJson(cle, v) {
  try {
    localStorage.setItem(cle, JSON.stringify(v))
  } catch (e) {
    // Stockage indisponible : les donnees restent en memoire.
  }
}
const moisCourant = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export const useServantsStore = defineStore('servants', {
  state: () => ({
    lieux: LIEUX.map((l) => ({ ...l })),
    liste: SERVANTS.map((s, i) => ({
      id: s.id, lieu: s.lieu, prenom: s.prenom, nom: s.nom, grade: s.grade,
      contact: `+229 97 00 00 ${String(10 + i).padStart(2, '0')}`,
      dateNaissance: `${2008 + (i % 6)}-0${1 + (i % 9)}-15`,
      actif: true
    })),
    // Compteurs de départ (avant les séances saisies dans l'application)
    base: Object.fromEntries(SERVANTS.map((s) => [s.id, { semaine: s.semaine, dimanche: s.dimanche, absences: s.absences, jours: [...s.jours] }])),
    mutations: [], // historique des mutations (RG2)
    // Séances de présence : clé "type|date|lieu" → { [servantId]: 'present' | 'absent' | 'permission' }
    presences: lirePresences(),
    // Classements definis par les responsables : cle "type|lieu" -> [servantId dans l ordre]
    classements: lireJson('servants-classements'),
    // Affectations de service : cle "type|date|lieu" -> { posteId: servantId }
    affectations: lireJson('servants-affectations')
  }),
  getters: {
    nomLieu: (s) => (id) => s.lieux.find((l) => l.id === id)?.nom ?? id,

    // Compteurs d'un servant = compteurs de départ + séances du mois en cours (RG6).
    // Les séances des mois précédents restent conservées mais ne comptent plus.
    stats() {
      return (id) => {
        const b = this.base[id] || { semaine: 0, dimanche: 0, absences: 0, jours: Array(7).fill('-') }
        const r = { semaine: b.semaine, dimanche: b.dimanche, absences: b.absences, permissions: 0, jours: [...b.jours] }
        const mois = moisCourant()
        for (const [cle, valeurs] of Object.entries(this.presences)) {
          const [type, date] = cle.split('|')
          const v = valeurs[id]
          if (!v) continue
          const d = new Date(`${date}T00:00:00`)
          const ecart = Math.floor((Date.now() - d) / 86400000)
          if (ecart >= 0 && ecart < 7) r.jours[(d.getDay() + 6) % 7] = SYMBOLE[v] || '-'
          if (date.slice(0, 7) !== mois) continue
          if (v === 'present') r[type] = (r[type] || 0) + 1
          else if (v === 'absent') r.absences++
          else if (v === 'permission') {
            r.permissions++
            if (PERMISSION_COMPTE_ABSENCE) r.absences++
          }
        }
        return r
      }
    },

    // Séances enregistrées d'un lieu, de la plus récente à la plus ancienne
    seances: (s) => (lieu) => Object.entries(s.presences)
      .map(([cle, v]) => {
        const [type, date, l] = cle.split('|')
        const valeurs = Object.values(v)
        return {
          cle, type, date, lieu: l,
          presents: valeurs.filter((x) => x === 'present').length,
          absents: valeurs.filter((x) => x === 'absent').length,
          permissions: valeurs.filter((x) => x === 'permission').length
        }
      })
      .filter((x) => x.lieu === lieu)
      .sort((a, b) => b.date.localeCompare(a.date) || a.type.localeCompare(b.type)),

    // Classement d'un lieu : tri par présences cumulées, ex æquo au même rang (RG5)
    bilan() {
      return (lieu, debut, fin) => {
        const lignes = this.liste
          .filter((x) => x.lieu === lieu && x.actif)
          .map((x) => ({ id: x.id, nomComplet: x.prenom + ' ' + x.nom, nom: x.nom, grade: x.grade, presents: 0, absents: 0, permissions: 0 }))
        const index = {}
        lignes.forEach((ligne) => { index[ligne.id] = ligne })
        for (const [cle, valeurs] of Object.entries(this.presences)) {
          const [type, date, lieuSeance] = cle.split('|')
          if (type !== 'reunion' || lieuSeance !== lieu || date < debut || date > fin) continue
          for (const [id, v] of Object.entries(valeurs)) {
            const cible = index[id]
            if (!cible) continue
            if (v === 'present') cible.presents++
            else if (v === 'absent') cible.absents++
            else if (v === 'permission') cible.permissions++
          }
        }
        return lignes.sort((a, b) => b.presents - a.presents || a.nom.localeCompare(b.nom))
      }
    },

    seancesService: (s) => (lieu) => Object.entries(s.affectations)
      .map(([cle, v]) => {
        const [type, date, l] = cle.split('|')
        return { cle, type, date, lieu: l, nb: Object.keys(v).length }
      })
      .filter((x) => x.lieu === lieu)
      .sort((a, b) => b.date.localeCompare(a.date) || a.type.localeCompare(b.type)),

    // Classement defini par le responsable du lieu (lot 27). Postulants et stagiaires exclus. Concu par coherence, a valider.
    classement() {
      return (lieu, type) => {
        const classables = this.liste.filter((x) => x.lieu === lieu && x.actif && classable(x.grade))
        const par = {}
        classables.forEach((x) => { par[x.id] = x })
        const ordre = (this.classements[type + '|' + lieu] || []).filter((id) => par[id])
        const reste = classables.filter((x) => !ordre.includes(x.id)).sort((a, b) => a.nom.localeCompare(b.nom)).map((x) => x.id)
        return ordre.concat(reste).map((id, i) => {
          const x = par[id]
          const st = this.stats(x.id)
          const p = st.semaine + st.dimanche
          return { id: x.id, nomComplet: x.prenom + ' ' + x.nom, nom: x.nom, grade: x.grade, presences: st[type], absences: st.absences, taux: Math.round((p / ((p + st.absences) || 1)) * 100), rang: i + 1 }
        })
      }
    },

    // Service de messe le plus recent d un lieu pour un type (dimanche ou semaine) : derniere date passee, sinon la plus proche a venir.
    // Le classement est l attribution des postes par le responsable (decision du porteur, lot 28b). Concu par coherence, a valider.
    serviceRecent() {
      return (lieu, type) => {
        const d = new Date()
        const aujourdhui = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        const seances = Object.entries(this.affectations)
          .map(([cle, v]) => { const [t, date, l] = cle.split('|'); return { t, date, l, v } })
          .filter((x) => x.t === type && x.l === lieu && Object.keys(x.v).length)
        if (!seances.length) return null
        const passees = seances.filter((x) => x.date <= aujourdhui).sort((a, b) => b.date.localeCompare(a.date))
        const choisie = passees.length ? passees[0] : seances.sort((a, b) => a.date.localeCompare(b.date))[0]
        return { date: choisie.date, affectations: choisie.v }
      }
    },

    // Lignes du classement de service : un poste par ligne, dans l ordre de POSTES
    classementService() {
      return (lieu, type) => {
        const s = this.serviceRecent(lieu, type)
        if (!s) return { date: null, lignes: [] }
        const lignes = POSTES
          .filter((p) => s.affectations[p.id] !== undefined)
          .map((p) => {
            const x = this.liste.find((v) => v.id === Number(s.affectations[p.id]))
            return x ? { posteId: p.id, poste: p.label, id: x.id, nomComplet: `${x.prenom} ${x.nom}`, grade: x.grade } : null
          })
          .filter(Boolean)
        return { date: s.date, lignes }
      }
    },

    // Poste d un servant a la messe la plus recente (null si non attribue)
    posteDe() {
      return (servantId, lieu, type) => {
        const l = this.classementService(lieu, type).lignes.find((x) => x.id === Number(servantId))
        return l ? l.poste : null
      }
    },

    // Historique d un servant (lot 28c) : presences marquees et postes attribues, pour les notifications des parents
    presencesDe() {
      return (id) => Object.entries(this.presences)
        .map(([cle, v]) => { const [type, date, lieu] = cle.split('|'); return { type, date, lieu, statut: v[id] } })
        .filter((x) => x.statut)
    },

    postesDe() {
      return (id) => Object.entries(this.affectations).flatMap(([cle, v]) => {
        const [type, date, lieu] = cle.split('|')
        const p = POSTES.find((q) => v[q.id] !== undefined && Number(v[q.id]) === Number(id))
        return p ? [{ type, date, lieu, poste: p.label }] : []
      })
    },

    // Ancien calcul par presences (conserve, non utilise depuis les lots 27, 28b et 28c)
    classementCalcule() {
      return (lieu, type) => {
        const lignes = this.liste
          .filter((x) => x.lieu === lieu && x.actif)
          .map((x) => {
            const st = this.stats(x.id)
            const p = st.semaine + st.dimanche
            return {
              id: x.id, nomComplet: `${x.prenom} ${x.nom}`, nom: x.nom, grade: x.grade,
              presences: st[type], absences: st.absences,
              taux: Math.round((p / ((p + st.absences) || 1)) * 100)
            }
          })
          .sort((a, b) => b.presences - a.presences || a.nom.localeCompare(b.nom))
        let rang = 0
        return lignes.map((x, i) => {
          if (i === 0 || lignes[i - 1].presences !== x.presences) rang = i + 1
          return { ...x, rang }
        })
      }
    }
  },
  actions: {
    ajouter(data) {
      const id = Math.max(0, ...this.liste.map((s) => s.id)) + 1
      this.liste.push({ id, actif: true, ...data })
      this.base[id] = { semaine: 0, dimanche: 0, absences: 0, jours: Array(7).fill('-') }
    },
    modifier(id, data) {
      const s = this.liste.find((x) => x.id === id)
      if (data.lieu !== s.lieu) {
        this.mutations.push({ servantId: id, ancienLieu: s.lieu, nouveauLieu: data.lieu, date: new Date().toISOString() })
      }
      const ancienne = s.photo || null
      if ('photo' in data && ancienne && ancienne !== (data.photo || null)) s.photoPrecedente = { image: ancienne, date: new Date().toISOString() }
      Object.assign(s, data)
    },
    purgerPhotos() {
      for (const s of this.liste) { if (s.photoPrecedente && !photoRecuperable(s.photoPrecedente)) s.photoPrecedente = null }
    },
    basculerStatut(id) {
      const s = this.liste.find((x) => x.id === id)
      s.actif = !s.actif
    },
    // Enregistre (ou remplace) une séance : clé "type|date|lieu"
    definirClassement(lieu, type, ids) {
      this.classements[type + '|' + lieu] = [...ids]
      sauverJson('servants-classements', this.classements)
    },
    // Affectation de service : cle "type|date|lieu" -> { posteId: servantId }
    enregistrerAffectation(cle, valeurs) {
      if (Object.keys(valeurs).length) this.affectations[cle] = { ...valeurs }
      else delete this.affectations[cle]
      sauverJson('servants-affectations', this.affectations)
    },
    enregistrerPresences(cle, valeurs) {
      this.presences[cle] = { ...valeurs }
      sauverPresences(this.presences)
    },
    // Nouveau lieu : toujours une station rattachée à la paroisse d'Adjagbo
    ajouterLieu(nom, image = null) {
      const id = nom.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      if (!id || this.lieux.some((l) => l.id === id)) throw new Error('Ce lieu de culte existe déjà.')
      this.lieux.push({ id, nom, type: 'Station', image })
    },
    modifierImageLieu(id, image) {
      const l = this.lieux.find((x) => x.id === id)
      if (l) l.image = image
    },
    supprimerLieu(id) {
      if (this.liste.some((s) => s.lieu === id)) throw new Error('Ce lieu a des servants : transférez-les avant de le supprimer.')
      this.lieux = this.lieux.filter((l) => l.id !== id)
    }
  }
})
