<template>
  <section class="card mt-5 p-5" aria-labelledby="dem-titre">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 id="dem-titre" class="text-lg font-bold text-navy-900">Demandes d&rsquo;acc&egrave;s des parents</h2>
      <span class="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">{{ demandes.enAttente.length }} en attente</span>
    </div>
    <p v-if="!demandes.enAttente.length" class="mt-3 text-sm text-slate-500">Aucune demande en attente.</p>
    <ul v-else class="mt-4 space-y-3">
      <li v-for="d in demandes.enAttente" :key="d.id" class="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="space-y-1">
            <p class="font-semibold text-navy-900">{{ d.nomParent }} <span class="text-xs font-normal text-slate-500">({{ d.lien }}) &middot; {{ jour(d.date) }}</span></p>
            <p class="text-slate-600">Enfant : {{ d.nomEnfant }}<span v-if="d.lieu"> &middot; {{ d.lieu }}</span></p>
            <p class="text-slate-600">T&eacute;l&eacute;phone : {{ d.telephone }}<span v-if="d.email"> &middot; {{ d.email }}</span></p>
            <p v-if="d.message" class="text-slate-500">&laquo; {{ d.message }} &raquo;</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="btn-primary" @click="$emit('creer', d)">Cr&eacute;er le compte</button>
            <button type="button" class="btn border border-slate-300" @click="refuser(d)">Refuser</button>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { onMounted } from "vue"
import { useDemandesStore } from "@/stores/demandes"

defineEmits(["creer"])
const demandes = useDemandesStore()
const jour = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
function refuser(d) {
  if (!confirm("Refuser la demande de " + d.nomParent + " ?")) return
  demandes.traiter(d.id, "refusee")
}
onMounted(() => demandes.recharger())
</script>
