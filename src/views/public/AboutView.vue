<template>
  <div class="page-fond">
    <PageDeco />
    <div class="page-contenu">
      <div class="page-entete">
        <h1 class="page-titre">{{ ap.titre }}</h1>
        <p class="page-sous">{{ ap.sous }}</p>
      </div>

      <section class="page-bloc">
        <h2 class="page-bloc__titre">{{ ap.introTitre }}</h2>
        <p class="fiche__texte">{{ ap.intro }}</p>
      </section>

      <section class="page-bloc">
        <h2 class="page-bloc__titre">Trois lieux de culte</h2>
        <div class="info-grille info-grille--3">
          <RouterLink v-for="l in lieux" :key="l.id" :to="{ name: 'classements', query: { lieu: l.id } }" class="info-carte">
            <span class="info-carte__tete">
              <span class="info-carte__icone"><EgliseIcon class="h-6 w-6" /></span>
              <span class="info-carte__titre">{{ l.nom }}<span class="info-carte__sous">{{ l.type }}</span></span>
            </span>
            <span class="info-carte__texte">{{ l.texte }}</span>
          </RouterLink>
        </div>
      </section>

      <section class="page-bloc">
        <h2 class="page-bloc__titre">Ce que vous pouvez consulter</h2>
        <div class="info-grille info-grille--3">
          <div v-for="c in consultables" :key="c.titre" class="info-carte">
            <p class="info-carte__titre">{{ c.titre }}</p>
            <p class="info-carte__texte">{{ c.texte }}</p>
          </div>
        </div>
      </section>

      <section class="page-bloc">
        <h2 class="page-bloc__titre">Comprendre le code couleur des absences</h2>
        <p class="fiche__texte">Le niveau dépend du nombre d&rsquo;absences d&rsquo;un servant dans le mois en cours.</p>
        <div class="info-niveau" v-for="n in niveaux" :key="n.nb">
          <span class="info-niveau__badge"><AbsenceBadge :absences="n.nb" /></span>
          <span>{{ n.texte }}</span>
        </div>
      </section>

      <div class="info-grille info-grille--2">
        <section class="page-bloc !mt-0">
          <h2 class="page-bloc__titre">Règles de calcul</h2>
          <ul class="info-liste">
            <li>Le classement de la semaine et celui du dimanche sont définis séparément par le responsable de chaque lieu de culte.</li>
            <li>L&rsquo;ordre du classement est décidé par le responsable, il n&rsquo;est pas calculé automatiquement. Les postulants et les stagiaires n&rsquo;y figurent pas.</li>
            <li>Un servant permissionn&eacute; n&rsquo;est compt&eacute; ni comme absent ni comme servant : aucune p&eacute;nalit&eacute;.</li>
            <li>Les compteurs repartent à zéro au début de chaque mois.</li>
          </ul>
        </section>
        <section class="page-bloc !mt-0">
          <h2 class="page-bloc__titre">Ce qui reste privé</h2>
          <ul class="info-liste">
            <li>Le site public affiche le nom complet, le grade, le lieu, le poste de service et le code couleur d&rsquo;absence.</li>
            <li>Contact, date de naissance et sanctions ne sont jamais affich&eacute;s publiquement.</li>
            <li>Les photos des servants ne sont visibles que des parents disposant d&rsquo;un compte sp&eacute;cial. Le public n&rsquo;en voit aucune.</li>
            <li>Les alertes d&rsquo;absence et les &eacute;v&eacute;nements cibl&eacute;s sur un enfant sont r&eacute;serv&eacute;s aux parents dont l&rsquo;administration a cr&eacute;&eacute; un compte, sur leur demande. Le public voit seulement les &eacute;v&eacute;nements des lieux de culte.</li>
            <li>Les pages publiques sont en lecture seule.</li>
          </ul>
        </section>
      </div>

      <section class="page-bloc">
        <div class="info-cta">
          <div>
            <h2 class="page-bloc__titre">Espace des responsables</h2>
            <p class="fiche__texte !mt-1">Les responsables de lieu de culte et l&rsquo;administrateur global se connectent pour gérer les servants et les présences.</p>
          </div>
          <RouterLink to="/connexion" class="pill-gold">Connexion <span aria-hidden="true">→</span></RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import AbsenceBadge from '@/components/AbsenceBadge.vue'
import EgliseIcon from '@/components/EgliseIcon.vue'
import PageDeco from '@/components/PageDeco.vue'
import { useAProposStore } from "@/stores/apropos"
const ap = useAProposStore()

const lieux = [
  { id: 'adjagbo', nom: 'Adjagbo', type: 'Paroisse', texte: 'La paroisse, dont dépendent les deux stations.' },
  { id: 'dome', nom: 'Dôme', type: 'Station', texte: 'Station de la paroisse d\u2019Adjagbo.' },
  { id: 'ayimlonfide', nom: 'Ayimlonfidé', type: 'Station', texte: 'Station de la paroisse d\u2019Adjagbo.' }
]
const consultables = [
  { titre: 'Postes de la messe de la semaine', texte: 'Poste de service de chaque servant pour la messe de la semaine, défini par le responsable du lieu de culte.' },
  { titre: 'Postes de la messe du dimanche', texte: 'Poste de service de chaque servant pour la messe du dimanche, défini par le responsable du lieu de culte.' },
  { titre: 'Suivi des absences', texte: 'Liste des servants absents ce mois-ci, avec un code couleur, pour que les parents suivent l\u2019assiduité.' }
]
const niveaux = [
  { nb: 1, texte: '1 absence dans le mois.' },
  { nb: 2, texte: '2 absences dans le mois.' },
  { nb: 3, texte: '3 absences ou plus dans le mois.' }
]
</script>