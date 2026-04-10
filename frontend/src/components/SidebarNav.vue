<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">
        <HeartIcon class="icon-logo" />
      </div>
      <div>
        <h2>Citas Médicas</h2>
        <p>Sistema de gestión</p>
      </div>
    </div>

    <div class="sidebar-user">
      <div class="user-avatar">{{ iniciales }}</div>
      <div>
        <p class="user-name">{{ authStore.usuario?.nombre }}</p>
        <span class="rol-badge">{{ authStore.usuario?.rol }}</span>
      </div>
    </div>

    <nav>
      <router-link to="/">
        <Squares2X2Icon class="nav-icon" />
        Dashboard
      </router-link>
      <router-link to="/pacientes">
        <UsersIcon class="nav-icon" />
        Pacientes
      </router-link>
      <router-link to="/medicos">
        <UserGroupIcon class="nav-icon" />
        Médicos
      </router-link>
      <router-link to="/citas">
        <CalendarDaysIcon class="nav-icon" />
        Citas
      </router-link>
      <router-link to="/disponibilidad">
        <CalendarIcon class="nav-icon" />
        Disponibilidad
      </router-link>
    </nav>

    <button class="logout" @click="handleLogout">
      <ArrowLeftOnRectangleIcon class="nav-icon" />
      Cerrar Sesión
    </button>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import Swal from 'sweetalert2'
import {
  HeartIcon,
  Squares2X2Icon,
  UsersIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const iniciales = computed(() => {
  const nombre = authStore.usuario?.nombre || ''
  return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

async function handleLogout() {
  const result = await Swal.fire({
    title: '¿Cerrar sesión?',
    text: '¿Estás seguro que deseas salir del sistema?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#2563eb'
  })
  if (result.isConfirmed) {
    authStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: #0f172a;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  gap: 1.5rem;
  min-height: 100vh;
}
.sidebar-logo { display: flex; align-items: center; gap: 0.75rem; padding: 0 0.5rem; }
.logo-icon {
  width: 40px; height: 40px;
  background: #2563eb;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.icon-logo { width: 22px; height: 22px; color: white; }
.sidebar-logo h2 { font-size: 1rem; font-weight: 600; color: white; margin: 0; }
.sidebar-logo p { font-size: 0.75rem; color: #64748b; margin: 0; }
.sidebar-user {
  display: flex; align-items: center; gap: 0.75rem;
  background: #1e293b;
  border-radius: 10px;
  padding: 0.75rem;
}
.user-avatar {
  width: 36px; height: 36px;
  background: #2563eb;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 600; color: white;
  flex-shrink: 0;
}
.user-name { font-size: 0.875rem; font-weight: 500; color: #f1f5f9; margin: 0; }
.rol-badge {
  font-size: 0.7rem;
  background: #1d4ed8;
  color: #bfdbfe;
  padding: 0.1rem 0.5rem;
  border-radius: 20px;
}
nav { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }
nav a {
  display: flex; align-items: center; gap: 0.75rem;
  color: #94a3b8;
  text-decoration: none;
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.15s;
}
nav a:hover { background: #1e293b; color: #f1f5f9; }
nav a.router-link-active { background: #2563eb; color: white; }
.nav-icon { width: 18px; height: 18px; flex-shrink: 0; }
.logout {
  display: flex; align-items: center; gap: 0.75rem;
  background: transparent;
  color: #94a3b8;
  border: 1px solid #1e293b;
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  width: 100%;
  transition: all 0.15s;
}
.logout:hover { background: #7f1d1d; color: #fca5a5; border-color: #7f1d1d; }
</style>