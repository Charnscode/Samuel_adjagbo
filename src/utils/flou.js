// Lot 18 : photo publique floutee de facon extreme (miniature agrandie), irreversible. Couture back : le serveur doit faire de meme.
export function flouterPhoto(src, petit = 8, sortie = 96) {
  return new Promise((resolve) => {
    if (!src) return resolve(null)
    const img = new Image()
    img.onerror = () => resolve(null)
    img.onload = () => {
      const m = Math.min(img.width, img.height)
      const a = document.createElement("canvas")
      a.width = petit
      a.height = petit
      a.getContext("2d").drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, petit, petit)
      const b = document.createElement("canvas")
      b.width = sortie
      b.height = sortie
      const cb = b.getContext("2d")
      cb.imageSmoothingEnabled = true
      cb.imageSmoothingQuality = "high"
      cb.drawImage(a, 0, 0, petit, petit, 0, 0, sortie, sortie)
      resolve(b.toDataURL("image/jpeg", 0.5))
    }
    img.src = src
  })
}
