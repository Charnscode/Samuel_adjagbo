// Lot 15 : source unique des images de lieux et de photos de servants (store d abord, image de depart ensuite).
import { useServantsStore } from '@/stores/servants'
import { VISUELS } from '@/config'

export const imageLieu = (id) => useServantsStore().lieux.find((l) => l.id === id)?.image || VISUELS.lieux[id] || VISUELS.accueil
export const photoServant = (id) => useServantsStore().liste.find((s) => s.id === id)?.photo || VISUELS.servant
