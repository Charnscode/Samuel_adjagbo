// Source unique du guide (cartes pedagogiques) : textes, icones et images par profil.
// Textes concus par coherence, courts et concrets, a valider. Les accents passent par des sequences backslash-u.
export const FOND = '/images/guide/guide-fond.png'

export const ICONES = {
  eglise: 'M12 2v4M10 4h4M12 6l5 4v11H7V10zM3 21h18M10 21v-5h4v5',
  classement: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z',
  alerte: 'M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0',
  calendrier: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4',
  present: 'M9 12l2 2 4-4M5 4h14v16H5z',
  servants: 'M16 20v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 20v-1a3 3 0 0 0-2-2.8',
  cloche: 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0',
  bouclier: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  utilisateurs: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21a8 8 0 0 1 16 0',
  rapport: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
  stat: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  cle: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
  etoile: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z'
}

export const PROFILS = {
  visiteur: {
    libelle: 'Visiteur',
    image: '/images/guide/guide-visiteur.png',
    etapes: [
      { icone: 'eglise', titre: 'Bienvenue chez les servants', texte: 'Suivez les servants de la paroisse d\u2019Adjagbo, en toute transparence. L\u2019essentiel en trente secondes.' },
      { icone: 'eglise', titre: 'Trois lieux de culte', texte: 'D\u00f4me, Adjagbo et Ayimlonfid\u00e9 : touchez une \u00e9glise sur l\u2019accueil pour la d\u00e9couvrir.' },
      { icone: 'classement', titre: 'Qui sert \u00e0 l\u2019autel ?', texte: 'La page Classements montre le poste de chaque servant, pour la messe du dimanche et celle de la semaine.' },
      { icone: 'alerte', titre: 'Un code couleur, un regard', texte: 'Les couleurs de la page Absences disent l\u2019essentiel d\u2019un seul regard.' },
      { icone: 'cle', titre: 'Parent ? Demandez votre acc\u00e8s', texte: 'Alertes, \u00e9v\u00e9nements, pr\u00e9sences de votre enfant : l\u2019administrateur cr\u00e9e votre compte sur demande.' }
    ]
  },
  parent: {
    libelle: 'Parent',
    image: '/images/guide/guide-parent.png',
    etapes: [
      { icone: 'etoile', titre: 'Votre enfant, \u00e0 port\u00e9e de main', texte: 'Tout ce qui concerne son service \u00e0 la messe, au m\u00eame endroit.' },
      { icone: 'rapport', titre: 'Un fil d\u2019actualit\u00e9s vivant', texte: '\u00c9v\u00e9nements, pr\u00e9sences, absences et postes arrivent dans la carte Notifications.' },
      { icone: 'present', titre: 'Un clic, tout le d\u00e9tail', texte: 'Touchez la carte de votre enfant : poste, alertes, sanctions et \u00e9v\u00e9nements \u00e0 venir.' },
      { icone: 'calendrier', titre: 'Aucun \u00e9v\u00e9nement manqu\u00e9', texte: 'Les \u00e9v\u00e9nements de son lieu de culte et de son grade sont signal\u00e9s pour vous.' },
      { icone: 'cloche', titre: 'Activez les notifications', texte: 'Autorisez votre navigateur : vous serez pr\u00e9venu d\u00e8s qu\u2019il y a du nouveau.' }
    ]
  },
  responsable: {
    libelle: 'Responsable',
    image: '/images/guide/guide-responsable.png',
    etapes: [
      { icone: 'etoile', titre: 'Votre lieu de culte, bien tenu', texte: 'Quelques gestes simples pour suivre tous vos servants.' },
      { icone: 'servants', titre: 'Vos servants', texte: 'Ajoutez un servant, changez son grade, mettez ses informations \u00e0 jour. Vous g\u00e9rez votre lieu.' },
      { icone: 'present', titre: 'Les pr\u00e9sences', texte: 'Choisissez la date, Messe ou R\u00e9union, puis marquez pr\u00e9sent, absent ou permissionn\u00e9. Jamais dans le futur.' },
      { icone: 'classement', titre: 'Le service de messe', texte: 'Attribuez chaque poste \u00e0 l\u2019autel au bon servant. Un seul poste suffit pour enregistrer.' },
      { icone: 'calendrier', titre: '\u00c9v\u00e9nements et sanctions', texte: 'Cr\u00e9ez et modifiez les \u00e9v\u00e9nements de votre lieu, et g\u00e9rez les sanctions.' }
    ]
  },
  admin: {
    libelle: 'Administrateur',
    image: '/images/guide/guide-admin.png',
    etapes: [
      { icone: 'etoile', titre: 'Toute la paroisse, d\u2019un regard', texte: 'Tableau de bord, stations, comptes : vous pilotez l\u2019ensemble de la plateforme.' },
      { icone: 'eglise', titre: 'Stations et \u00e9v\u00e9nements', texte: 'Ajoutez un lieu de culte avec son image, publiez les \u00e9v\u00e9nements pour toute la paroisse.' },
      { icone: 'utilisateurs', titre: 'Comptes et acc\u00e8s', texte: 'Cr\u00e9ez les comptes des responsables et des parents, et traitez les demandes d\u2019acc\u00e8s.' },
      { icone: 'stat', titre: 'Statistiques et rapports', texte: 'Suivez l\u2019assiduit\u00e9 de chaque lieu et consultez les rapports.' },
      { icone: 'bouclier', titre: 'Sanctions et param\u00e8tres', texte: 'Une sanction reste active jusqu\u2019\u00e0 sa lev\u00e9e. Votre profil se r\u00e8gle dans Param\u00e8tres.' }
    ]
  }
}

export const cleVu = (profil) => 'guide-vu-' + profil

export function profilDe(user) {
  if (!user) return 'visiteur'
  if (user.role === 'parent') return 'parent'
  if (user.role === 'admin_global') return 'admin'
  if (user.role === 'responsable_lieu') return 'responsable'
  return 'visiteur'
}
