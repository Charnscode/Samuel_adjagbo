<template>
  <svg v-if="type === 'nef'" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="nef-fond" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#081635" /><stop offset="1" stop-color="#10296A" />
      </linearGradient>
      <radialGradient id="nef-lueur" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#FBBF24" stop-opacity=".55" /><stop offset="1" stop-color="#FBBF24" stop-opacity="0" />
      </radialGradient>
      <clipPath id="nef-arche"><path d="M540 340V150a60 60 0 0 1 120 0v190z" /></clipPath>
    </defs>
    <rect width="800" height="400" fill="url(#nef-fond)" />
    <circle cx="600" cy="200" r="260" fill="url(#nef-lueur)" />
    <polygon points="560,330 640,330 800,400 400,400" fill="#fff" opacity=".05" />
    <g clip-path="url(#nef-arche)">
      <rect v-for="(c, i) in vitrail" :key="i" :x="540 + (i % 3) * 40" :y="90 + Math.floor(i / 3) * 42" width="40" height="42" :fill="c" />
    </g>
    <path d="M540 340V150a60 60 0 0 1 120 0v190zM600 90v250M540 190h120M540 260h120" fill="none" stroke="#081635" stroke-width="4" />
    <g fill="#F5B83D"><rect x="396" y="70" width="8" height="90" rx="2" /><rect x="372" y="94" width="56" height="8" rx="2" /></g>
    <rect y="340" width="800" height="60" fill="#050E24" />
    <g v-for="x in [120, 180, 250, 330, 430, 510]" :key="x">
      <circle :cx="x" cy="318" r="22" fill="url(#nef-lueur)" />
      <rect :x="x - 3" y="320" width="6" height="20" fill="#F8EBD0" />
      <ellipse :cx="x" cy="315" rx="3" ry="6" fill="#FBBF24" />
    </g>
  </svg>

  <svg v-else viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="eg-ciel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1B3A85" /><stop offset="1" stop-color="#F2C98B" />
      </linearGradient>
    </defs>
    <rect width="400" height="200" fill="url(#eg-ciel)" />
    <rect y="165" width="400" height="35" fill="#0B1F4B" />
    <circle cx="60" cy="150" r="26" fill="#0F3B2E" /><circle cx="345" cy="152" r="30" fill="#0F3B2E" />
    <rect x="120" y="95" width="160" height="72" fill="#F4E8D2" />
    <polygon points="112,95 200,55 288,95" fill="#B45F3C" />
    <rect x="178" y="30" width="44" height="70" fill="#F4E8D2" />
    <polygon points="172,32 200,10 228,32" fill="#B45F3C" />
    <rect x="198" y="0" width="4" height="12" fill="#F5B83D" /><rect x="193" y="4" width="14" height="3" fill="#F5B83D" />
    <path d="M186 167v-30a14 14 0 0 1 28 0v30z" fill="#0B1F4B" />
    <rect v-for="x in [134, 150, 236, 252]" :key="x" :x="x" y="112" width="10" height="18" rx="5" fill="#1B3A85" />
  </svg>
</template>

<script setup>
defineProps({ type: { type: String, default: 'nef' } })
const vitrail = ['#DC2626', '#F59E0B', '#2563EB', '#16A34A', '#7C3AED', '#F59E0B', '#2563EB', '#DC2626', '#16A34A', '#F59E0B', '#7C3AED', '#2563EB', '#16A34A', '#2563EB', '#DC2626', '#F59E0B', '#7C3AED', '#16A34A']
</script>