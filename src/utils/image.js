// Lot 15 : lecture et redimensionnement d une image choisie par l utilisateur.
// Mode mock : le resultat est une data URL (couture back : envoi du fichier au serveur).
export const TYPES_IMAGE = ['image/jpeg', 'image/png', 'image/webp']
export const TAILLE_MAX_FICHIER = 8 * 1024 * 1024

export function lireImage(fichier, cote = 480, qualite = 0.85) {
  return new Promise((resolve, reject) => {
    if (!fichier) return reject(new Error('Aucun fichier.'))
    if (!TYPES_IMAGE.includes(fichier.type)) return reject(new Error('Format non pris en charge : JPG, PNG ou WebP.'))
    if (fichier.size > TAILLE_MAX_FICHIER) return reject(new Error('Image trop lourde (8 Mo maximum).'))
    const lecteur = new FileReader()
    lecteur.onerror = () => reject(new Error('Lecture du fichier impossible.'))
    lecteur.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Image illisible.'))
      img.onload = () => {
        const ratio = Math.min(1, cote / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = Math.max(1, Math.round(img.width * ratio))
        c.height = Math.max(1, Math.round(img.height * ratio))
        const ctx = c.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, c.width, c.height)
        ctx.drawImage(img, 0, 0, c.width, c.height)
        resolve(c.toDataURL('image/jpeg', qualite))
      }
      img.src = lecteur.result
    }
    lecteur.readAsDataURL(fichier)
  })
}
