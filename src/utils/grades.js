// Source unique des grades de formation (du plus bas au plus haut) et des postes de service a l autel.
// Listes fournies par le porteur. Les postulants et les stagiaires ne figurent jamais dans les classements.
// Description du Thuriféraire : conçue par cohérence, à valider.
export const GRADES_DETAIL = [
  { id: 'Postulant', texte: 'Débute la formation et apprend les bases du service à l’autel.' },
  { id: 'Stagiaire', texte: 'Approfondit sa formation et apprend à servir la messe.' },
  { id: 'Acolyte', texte: 'S’occupe notamment des vases sacrés, des linges d’autel et de la clochette.' },
  { id: 'Porte-bénitier', texte: 'Porte le bénitier et les vases d’huiles lors de certaines célébrations.' },
  { id: 'Céroféraire', texte: 'Porte les cierges et participe au service liturgique.' },
  { id: 'Porte-croix', texte: 'Porte la croix de procession.' },
  { id: 'Naviculaire', texte: 'Porte la navette contenant l’encens.' },
  { id: 'Thuriféraire', texte: 'Porte l’encensoir et encense pendant la liturgie.' }
]

export const GRADES = GRADES_DETAIL.map((g) => g.id)
export const HORS_CLASSEMENT = ['Postulant', 'Stagiaire']
export const classable = (grade) => !HORS_CLASSEMENT.includes(grade)

export const POSTES = [
  { id: 'acolyte-principal', label: 'Acolyte Principal' },
  { id: 'acolyte-secondaire', label: 'Acolyte Secondaire' },
  { id: 'porte-croix', label: 'Porte Croix' },
  { id: 'porte-benitier', label: 'Porte Bénitier' },
  { id: 'ceroferaire-1', label: 'Céroféraire 1' },
  { id: 'ceroferaire-2', label: 'Céroféraire 2' },
  { id: 'naviculaire', label: 'Naviculaire' },
  { id: 'thuriferaire', label: 'Thuriféraire' }
]