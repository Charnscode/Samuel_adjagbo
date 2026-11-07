<template>
  <div class="imgchamp">
    <span class="text-sm font-medium">{{ label }}</span>
    <div class="imgchamp__corps">
      <span class="imgchamp__apercu" :class="forme === 'rond' ? 'imgchamp__apercu--rond' : 'imgchamp__apercu--carre'">
        <img v-if="modelValue" :src="modelValue" alt="" />
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8" /></svg>
      </span>
      <div class="imgchamp__actions">
        <label class="btn border border-slate-300 imgchamp__choisir" :class="{ 'imgchamp__choisir--off': disabled }">
          {{ modelValue ? 'Changer l’image' : 'Choisir une image' }}
          <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" :disabled="disabled" @change="choisir" />
        </label>
        <button v-if="modelValue && !disabled" type="button" class="text-sm font-semibold text-red-600" @click="emit('update:modelValue', null)">Retirer</button>
      </div>
    </div>
    <p v-if="erreur" class="text-xs text-red-600" role="alert">{{ erreur }}</p>
    <p v-else class="text-xs text-slate-500">JPG, PNG ou WebP. L’image est redimensionnée automatiquement.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { lireImage } from '@/utils/image'

const props = defineProps({
  modelValue: { type: String, default: null },
  label: { type: String, default: 'Image' },
  forme: { type: String, default: 'carre' }, // 'rond' | 'carre'
  cote: { type: Number, default: 480 },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])
const erreur = ref('')

async function choisir(e) {
  const fichier = e.target.files && e.target.files[0]
  e.target.value = ''
  if (!fichier) return
  erreur.value = ''
  try {
    emit('update:modelValue', await lireImage(fichier, props.cote))
  } catch (err) {
    erreur.value = err.message
  }
}
</script>
