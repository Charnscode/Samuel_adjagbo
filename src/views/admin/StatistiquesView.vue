<template>
  <div>
    <h1 class="text-2xl font-bold text-navy-900">Statistiques</h1>
    <p class="mt-1 text-sm capitalize text-slate-600">Tous lieux confondus · {{ mois }}</p>

    <div class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div v-for="k in kpis" :key="k.label" class="card p-4">
        <p class="text-2xl font-extrabold" :class="k.couleur">{{ k.valeur }}</p>
        <p class="mt-1 text-xs text-slate-500">{{ k.label }}</p>
      </div>
    </div>

    <div class="mt-6 grid gap-4 lg:grid-cols-2">
      <section class="card p-5">
        <h2 class="font-bold text-navy-900">Taux d’assiduité par lieu</h2>
        <ul class="mt-4 space-y-4">
          <li v-for="l in lignes" :key="l.id">
            <div class="flex justify-between text-sm"><span class="font-medium">{{ l.nom }}</span><span class="font-semibold">{{ l.taux }} %</span></div>
            <div class="mt-1 h-3 rounded-full bg-slate-100" role="img" :aria-label="`${l.nom} : ${l.taux} %`">
              <div class="h-3 rounded-full bg-brand" :style="{ width: `${l.taux}%` }" />
            </div>
          </li>
        </ul>
      </section>

      <section class="card p-5">
        <h2 class="font-bold text-navy-900">Servants par niveau d’absence</h2>
        <ul class="mt-4 space-y-3">
          <li v-for="n in niveaux" :key="n.label" class="flex items-center justify-between text-sm">
            <span class="flex items-center gap-2"><span class="h-3 w-3 rounded-full" :class="n.point" />{{ n.label }}</span>
            <span class="font-semibold">{{ n.total }}</span>
          </li>
        </ul>
      </section>
    </div>

    <div class="card mt-6 overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-600">
          <tr><th class="px-4 py-3">Lieu</th><th class="px-4 py-3">Servants actifs</th><th class="px-4 py-3">Présences</th><th class="px-4 py-3">Absences</th><th class="px-4 py-3">Taux</th><th class="px-4 py-3">Sanctions actives</th></tr>
        </thead>
        <tbody>
          <tr v-for="l in lignes" :key="l.id" class="border-t border-slate-100">
            <td class="px-4 py-3 font-semibold text-navy-900">{{ l.nom }}</td>
            <td class="px-4 py-3">{{ l.actifs }}</td><td class="px-4 py-3">{{ l.presences }}</td>
            <td class="px-4 py-3">{{ l.absences }}</td><td class="px-4 py-3">{{ l.taux }} %</td><td class="px-4 py-3">{{ l.sanctions }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useServantsStore } from '@/stores/servants'
import { useSanctionsStore } from '@/stores/sanctions'
import { niveauAbsence } from '@/utils/niveau'

const servants = useServantsStore()
const sanctions = useSanctionsStore()
const mois = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
const pct = (p, a) => Math.round((p / ((p + a) || 1)) * 100)

const actifs = computed(() => servants.liste.filter((s) => s.actif).map((s) => ({ ...s, ...servants.stats(s.id) })))

const lignes = computed(() => servants.lieux.map((l) => {
  const g = actifs.value.filter((s) => s.lieu === l.id)
  const presences = g.reduce((n, s) => n + s.semaine + s.dimanche, 0)
  const absences = g.reduce((n, s) => n + s.absences, 0)
  const sanctionnes = sanctions.liste.filter((x) => x.statut === 'active' && g.some((s) => s.id === x.servantId)).length
  return { id: l.id, nom: l.nom, actifs: g.length, presences, absences, taux: pct(presences, absences), sanctions: sanctionnes }
}))

const total = computed(() => lignes.value.reduce((t, l) => ({
  actifs: t.actifs + l.actifs, presences: t.presences + l.presences, absences: t.absences + l.absences, sanctions: t.sanctions + l.sanctions
}), { actifs: 0, presences: 0, absences: 0, sanctions: 0 }))

const kpis = computed(() => [
  { label: 'Servants actifs', valeur: total.value.actifs, couleur: 'text-brand' },
  { label: 'Taux d’assiduité global', valeur: `${pct(total.value.presences, total.value.absences)} %`, couleur: 'text-green-600' },
  { label: 'Absences du mois', valeur: total.value.absences, couleur: 'text-amber-600' },
  { label: 'Sanctions actives', valeur: total.value.sanctions, couleur: 'text-red-600' }
])

const niveaux = computed(() => [0, 1, 2, 3].map((n) => {
  const { label, point } = niveauAbsence(n)
  return { label, point, total: actifs.value.filter((s) => (n === 3 ? s.absences >= 3 : s.absences === n)).length }
}))
</script>