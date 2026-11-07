import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // Espace public : sans compte, lecture seule
  { path: '/', name: 'accueil', component: () => import('@/views/public/HomeView.vue'), meta: { layout: 'public' } },
  { path: '/classements', name: 'classements', component: () => import('@/views/public/ClassementServiceView.vue'), meta: { layout: 'public' } },
  { path: '/absences', name: 'absences', component: () => import('@/views/public/AbsencesView.vue'), meta: { layout: 'public' } },
  { path: '/servants', name: 'servants', component: () => import('@/views/public/ServantsView.vue'), meta: { layout: 'public' } },
  { path: '/a-propos', name: 'a-propos', component: () => import('@/views/public/AboutView.vue'), meta: { layout: 'public' } },
  { path: '/acces', name: 'demande-acces', component: () => import('@/views/public/DemandeAccesView.vue'), meta: { layout: 'public' } },
  { path: '/servants/:id', name: 'servant', component: () => import('@/views/public/ServantDetailView.vue'), meta: { layout: 'public' } },

  // Espace admin : pages Parametres et Rapports (meme protection que /admin)
  { path: '/admin/parametres', name: 'admin-parametres', component: () => import('@/views/admin/ParametresView.vue'), meta: { layout: 'admin', requiresAuth: true, roles: ['admin_global', 'responsable_lieu'] } },
  { path: '/admin/rapports', name: 'admin-rapports', component: () => import('@/views/admin/RapportsView.vue'), meta: { layout: 'admin', requiresAuth: true, roles: ['admin_global', 'responsable_lieu'] } },

  // Espace parent : compte cree par l administrateur
  { path: '/parent', name: 'parent', component: () => import('@/views/parent/ParentView.vue'), meta: { layout: 'public', requiresAuth: true, roles: ['parent'] } },

  // Connexion (administrateurs)
  { path: '/connexion', name: 'connexion', component: () => import('@/views/auth/LoginView.vue'), meta: { layout: 'blank' } },

  // Espace admin : protégé par rôle
  {
    path: '/admin',
    meta: { layout: 'admin', requiresAuth: true, roles: ['admin_global', 'responsable_lieu'] },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('@/views/admin/DashboardView.vue') },
      { path: 'servants', name: 'admin-servants', component: () => import('@/views/admin/ServantsView.vue') },
      { path: 'presences', name: 'admin-presences', component: () => import('@/views/admin/PresencesView.vue') },
      { path: 'affectations', name: 'admin-affectations', component: () => import('@/views/admin/AffectationsView.vue') },
      { path: 'classements', name: 'admin-classements', redirect: { name: 'admin-affectations' } },
      { path: 'absences', name: 'admin-absences', component: () => import('@/views/admin/AbsencesView.vue') },
      { path: 'sanctions', name: 'admin-sanctions', component: () => import('@/views/admin/SanctionsView.vue') },
      { path: 'lieux-de-culte', name: 'admin-lieux-de-culte', component: () => import('@/views/admin/LieuxView.vue'), meta: { roles: ['admin_global'] } },
      { path: 'utilisateurs', name: 'admin-utilisateurs', component: () => import('@/views/admin/UtilisateursView.vue'), meta: { roles: ['admin_global'] } },
      { path: 'statistiques', name: 'admin-statistiques', component: () => import('@/views/admin/StatistiquesView.vue'), meta: { roles: ['admin_global'] } },
      { path: 'evenements', name: 'admin-evenements', component: () => import('@/views/admin/EvenementsView.vue') }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const protege = to.matched.find((r) => r.meta.requiresAuth)
  if (protege && !auth.isAuthenticated) return { name: 'connexion', query: { redirect: to.fullPath } }
  const roles = [...to.matched].reverse().find((r) => r.meta.roles)?.meta.roles
  if (roles && auth.user && !roles.includes(auth.user.role)) return { name: 'accueil' }
  if (to.name === 'connexion' && auth.isAuthenticated) return { name: auth.user?.role === 'parent' ? 'parent' : 'admin-dashboard' }
})

export default router
