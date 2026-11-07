// Lot 17 : source unique du delai de recuperation de l ancienne photo de profil (mode mock, couture back).
export const DELAI_PHOTO_JOURS = 7
const JOUR = 86400000
export function joursRestantsPhoto(p) {
  if (!p || !p.date) return 0
  const reste = DELAI_PHOTO_JOURS - (Date.now() - new Date(p.date).getTime()) / JOUR
  return Math.max(0, Math.ceil(reste))
}
export const photoRecuperable = (p) => !!(p && p.image && joursRestantsPhoto(p) > 0)
