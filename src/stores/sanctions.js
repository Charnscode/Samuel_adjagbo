import { defineStore } from 'pinia'

const aujourdhui = () => new Date().toISOString().slice(0, 10)

export const useSanctionsStore = defineStore('sanctions', {
  state: () => ({
    liste: [
      { id: 1, servantId: 5, motif: 'Retards répétés', date: '2026-09-20', statut: 'active', par: 'Responsable Dôme' },
      { id: 2, servantId: 12, motif: 'Absences répétées', date: '2026-09-13', statut: 'active', par: 'Admin Global' },
      { id: 3, servantId: 9, motif: 'Comportement', date: '2026-09-06', statut: 'active', par: 'Responsable Adjagbo' },
      { id: 4, servantId: 4, motif: 'Retard', date: '2026-08-30', statut: 'levee', dateLevee: '2026-09-07', par: 'Responsable Dôme' }
    ]
  }),
  actions: {
    // Durée indéterminée : la sanction reste active jusqu'à sa levée manuelle (RG10)
    ajouter({ servantId, motif, par }) {
      const id = Math.max(0, ...this.liste.map((s) => s.id)) + 1
      this.liste.unshift({ id, servantId, motif, date: aujourdhui(), statut: 'active', par })
    },
    // L'historique est conservé : on change le statut, on ne supprime jamais
    lever(id) {
      const s = this.liste.find((x) => x.id === id)
      s.statut = 'levee'
      s.dateLevee = aujourdhui()
    }
  }
})