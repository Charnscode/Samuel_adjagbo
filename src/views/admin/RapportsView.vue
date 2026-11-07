<template>
  <div>
    <div class="rapport__outils">
      <div class="rapport__tete">
        <div>
          <h1 class="tb-titre">Rapports</h1>
          <span class="tb-trait" aria-hidden="true"></span>
          <p class="tb-sous">Rapport du mois en cours, à exporter ou à imprimer.</p>
        </div>
        <div class="rapport__boutons">
          <button type="button" class="admin__btn" @click="exporter">Exporter (CSV)</button>
          <button type="button" class="pill-gold" @click="imprimer">Imprimer / PDF</button>
        </div>
      </div>
      <div class="rapport__filtres">
        <div class="seg" role="tablist" aria-label="Type de rapport">
          <button v-for="t in types" :key="t.id" type="button" role="tab" :aria-selected="type === t.id"
            class="seg__bouton" :class="{ 'seg__bouton--actif': type === t.id }" @click="type = t.id">{{ t.label }}</button>
        </div>
        <select v-model="lieu" aria-label="Lieu de culte" class="champ !mt-0 page-select">
          <option value="tous">Tous les lieux</option>
          <option v-for="l in store.lieux" :key="l.id" :value="l.id">{{ l.nom }}</option>
        </select>
      </div>
    </div>

    <section class="page-bloc rapport__feuille">
      <h2 class="page-bloc__titre">{{ titreRapport }}</h2>
      <p class="fiche__texte">Généré le {{ dateJour }} · Données du mois : {{ mois }}</p>
      <div class="table-defile">
        <table v-if="type === 'absences'" class="table-pub">
          <caption class="sr-only">Servants ayant au moins une absence dans le mois</caption>
          <thead><tr><th>Nom complet</th><th>Grade</th><th>Lieu</th><th>Absences</th><th>Niveau</th></tr></thead>
          <tbody>
            <tr v-if="!lignes.length"><td colspan="5" class="page-vide">Aucun servant en absence ce mois-ci.</td></tr>
            <tr v-for="x in lignes" :key="x.cle">
              <td class="table-pub__lien">{{ x.nomComplet }}</td>
              <td class="table-pub__doux">{{ x.grade }}</td>
              <td class="table-pub__doux">{{ x.lieu }}</td>
              <td>{{ x.absences }}</td>
              <td><AbsenceBadge :absences="x.absences" /></td>
            </tr>
          </tbody>
        </table>
        <table v-else class="table-pub">
          <caption class="sr-only">Classement du mois par lieu de culte</caption>
          <thead><tr><th>Lieu</th><th>Rang</th><th>Nom complet</th><th>Grade</th><th>Présences</th><th>Taux</th><th>Absences</th></tr></thead>
          <tbody>
            <tr v-if="!lignes.length"><td colspan="7" class="page-vide">Aucun servant actif.</td></tr>
            <tr v-for="x in lignes" :key="x.cle">
              <td class="table-pub__doux">{{ x.lieu }}</td>
              <td><span class="rang" :class="{ 'rang--or': x.rang === 1 }">{{ x.rang }}</span></td>
              <td class="table-pub__lien">{{ x.nomComplet }}</td>
              <td class="table-pub__doux">{{ x.grade }}</td>
              <td>{{ x.presences }}</td>
              <td>{{ x.taux }} %</td>
              <td><AbsenceBadge :absences="x.absences" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useServantsStore } from '@/stores/servants'
import { niveauAbsence } from '@/utils/niveau'
import AbsenceBadge from '@/components/AbsenceBadge.vue'

const store = useServantsStore()
const types = [
  { id: 'semaine', label: 'Classement semaine', titre: 'Classement de la semaine' },
  { id: 'dimanche', label: 'Classement dimanche', titre: 'Classement du dimanche' },
  { id: 'absences', label: 'Suivi des absences', titre: 'Suivi des absences' }
]
const type = ref('semaine')
const lieu = ref('tous')
const mois = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
const dateJour = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

const lieuLabel = computed(() => (lieu.value === 'tous' ? 'Tous les lieux' : store.nomLieu(lieu.value)))
const titreRapport = computed(() => `${types.find((t) => t.id === type.value).titre} : ${lieuLabel.value}`)
const lieuxChoisis = computed(() => (lieu.value === 'tous' ? store.lieux : store.lieux.filter((l) => l.id === lieu.value)))

const lignes = computed(() => {
  if (type.value === 'absences') {
    return store.liste
      .filter((x) => x.actif && lieuxChoisis.value.some((l) => l.id === x.lieu))
      .map((x) => ({ cle: x.id, lieu: store.nomLieu(x.lieu), nomComplet: `${x.prenom} ${x.nom}`, grade: x.grade, absences: store.stats(x.id).absences }))
      .filter((x) => x.absences >= 1)
      .sort((a, b) => b.absences - a.absences || a.nomComplet.localeCompare(b.nomComplet))
  }
  return lieuxChoisis.value.flatMap((l) =>
    store.classement(l.id, type.value).map((x) => ({ ...x, cle: `${l.id}-${x.id}`, lieu: l.nom }))
  )
})

const entetes = computed(() => (type.value === 'absences'
  ? ['Nom complet', 'Grade', 'Lieu', 'Absences', 'Niveau']
  : ['Lieu', 'Rang', 'Nom complet', 'Grade', 'Présences', 'Taux', 'Niveau d\u2019absence']))
const corps = computed(() => lignes.value.map((x) => (type.value === 'absences'
  ? [x.nomComplet, x.grade, x.lieu, x.absences, niveauAbsence(x.absences).label]
  : [x.lieu, x.rang, x.nomComplet, x.grade, x.presences, `${x.taux} %`, niveauAbsence(x.absences).label])))

function exporter() {
  const guillemets = (v) => `"${String(v).replace(/"/g, '""')}"`
  const csv = '\ufeff' + [entetes.value, ...corps.value].map((l) => l.map(guillemets).join(';')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  a.download = `rapport-${type.value}-${lieu.value}.csv`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

function imprimer() { window.print() }
</script>