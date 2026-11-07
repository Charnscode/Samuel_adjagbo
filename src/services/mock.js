// Données simulées. Remplacées plus tard par les appels à l'API Express.
import { VISUELS } from '@/config'

export const LIEUX = [
  { id: 'dome', nom: 'Dôme', type: 'Station' },
  { id: 'adjagbo', nom: 'Adjagbo', type: 'Paroisse' },
  { id: 'ayimlonfide', nom: 'Ayimlonfidé', type: 'Station' }
]

// semaine / dimanche : présences du mois ; absences : absences du mois ;
// jours : présence de la semaine actuelle, Lun → Dim ('p' présent, 'a' absent)
const s = (id, lieu, prenom, nom, grade, semaine, dimanche, absences, jours, photo = null) =>
  ({ id, lieu, prenom, nom, grade, semaine, dimanche, absences, jours: jours.split(''), photo })

export const SERVANTS = [
  s(1, 'dome', 'Koffi', 'Dossou', 'Thuriféraire', 4, 4, 0, 'ppppppp', VISUELS.servant),
  s(2, 'dome', 'Mensah', 'Agbo', 'Acolyte', 4, 3, 0, 'ppppppp'),
  s(3, 'dome', 'Agbodjan', 'Chabi', 'Postulant', 3, 3, 1, 'pppappp'),
  s(4, 'dome', 'Houngbédji', 'Fadé', 'Céroféraire', 3, 2, 2, 'ppapapp'),
  s(5, 'dome', 'Soglo', 'Mèdéwou', 'Porte-croix', 2, 2, 3, 'apapapp'),
  s(6, 'adjagbo', 'Codjo', 'Atchadé', 'Naviculaire', 4, 4, 0, 'ppppppp'),
  s(7, 'adjagbo', 'Ahouansou', 'Brice', 'Stagiaire', 3, 4, 1, 'ppppapp'),
  s(8, 'adjagbo', 'Sènami', 'Tokpo', 'Acolyte', 3, 3, 1, 'pappppp'),
  s(9, 'adjagbo', 'Gbènou', 'Houénou', 'Porte-bénitier', 2, 3, 2, 'papppap'),
  s(10, 'ayimlonfide', 'Dègnon', 'Kpatchavi', 'Céroféraire', 4, 3, 0, 'ppppppp'),
  s(11, 'ayimlonfide', 'Wilfried', 'Zinsou', 'Postulant', 3, 3, 1, 'ppppppa'),
  s(12, 'ayimlonfide', 'Franck', 'Gnonlonfoun', 'Acolyte', 2, 2, 3, 'apapppa')
]

export const SANCTIONS_ACTIVES = [
  { servantId: 5, lieu: 'dome' }, { servantId: 12, lieu: 'ayimlonfide' }, { servantId: 9, lieu: 'adjagbo' }
]

export const ACTIVITES = [
  { id: 1, type: 'servant', texte: 'Nouveau servant enregistré', detail: 'Adjagbo · Aujourd’hui, 09:24', lieu: 'adjagbo' },
  { id: 2, type: 'sanction', texte: 'Sanction appliquée', detail: 'Dôme · Hier, 16:45', lieu: 'dome' },
  { id: 3, type: 'presence', texte: 'Présences marquées', detail: 'Ayimlonfidé · Hier, 14:32', lieu: 'ayimlonfide' },
  { id: 4, type: 'classement', texte: 'Classement mis à jour', detail: 'Dôme · Hier, 12:10', lieu: 'dome' }
]