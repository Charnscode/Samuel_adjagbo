// Statuts de présence : source unique. Valeurs stockées dans les séances : present, absent, permission.
// PERMISSION_COMPTE_ABSENCE : false = une permission ne compte ni comme présence ni comme absence (à valider par le porteur).
export const PERMISSION_COMPTE_ABSENCE = false

export const STATUTS = [
  { id: 'present', label: 'Présent', titre: 'Présent', classe: 'pre-opt--ok', symbole: 'p' },
  { id: 'absent', label: 'Absent', titre: 'Absent sans permission', classe: 'pre-opt--abs', symbole: 'a' },
  { id: 'permission', label: 'Permissionn\u00e9', titre: 'Permissionn\u00e9 : ni absent, ni compt\u00e9 dans le rang, aucune p\u00e9nalit\u00e9', classe: 'pre-opt--perm', symbole: 'e' }
]

export const SYMBOLE = Object.fromEntries(STATUTS.map((s) => [s.id, s.symbole]))
