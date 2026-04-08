import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue')
    },
    {
      path: '/registro',
      name: 'registro',
      component: () => import('../views/auth/RegistroView.vue')
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/pacientes',
      name: 'pacientes',
      component: () => import('../views/pacientes/PacientesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/medicos',
      name: 'medicos',
      component: () => import('../views/medicos/MedicosView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/citas',
      name: 'citas',
      component: () => import('../views/citas/CitasView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.estaAutenticado) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/registro') && authStore.estaAutenticado) {
    next('/')
  } else {
    next()
  }
})

export default router