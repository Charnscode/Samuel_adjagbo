// RG7 : 0 = Bon, 1 = noir, 2 = orange, 3 et plus = rouge (libellés du prototype)
export function niveauAbsence(n) {
  if (n >= 3) return { label: 'Critique', classe: 'bg-red-50 text-red-700', point: 'bg-alerte-rouge' }
  if (n === 2) return { label: 'Risque', classe: 'bg-amber-50 text-amber-700', point: 'bg-alerte-orange' }
  if (n === 1) return { label: 'Attention', classe: 'bg-slate-100 text-slate-800', point: 'bg-alerte-noir' }
  return { label: 'Bon', classe: 'bg-green-50 text-green-700', point: 'bg-green-500' }
}