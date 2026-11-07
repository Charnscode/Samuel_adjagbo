// Options de l'espace public. RG13 : pas de photo, pas de taux d'assiduité en public.
export const PUBLIC = {
  photos: false,
  photosFloutees: true,
  tauxAssiduite: false
}

export const VISUELS = {
  accueil: '/images/hero.jpg',
  connexion: '/images/connexion.jpg',
  servant: '/images/servant.jpg',
  banniere: '/images/banniere-pied.jpg',
  lieux: {
    dome: '/images/dome.jpg',
    adjagbo: '/images/adjagbo.jpg',
    ayimlonfide: '/images/ayimlonfide.jpg'
  }
}

// Logo unique (livre ouvert avec croix) : variante fond clair et variante fond sombre.
export const LOGO = {
  clair: '/images/logo-clair.svg',
  sombre: '/images/logo-sombre.svg',
  paroisse: '/images/logo-paroisse.jpg'
}

// true = données simulées ; false = API Express. Réglable via VITE_USE_MOCK dans .env
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
