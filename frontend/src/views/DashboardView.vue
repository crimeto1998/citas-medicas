<template>
  <div class="layout">
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

    <main class="main-content">
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p class="page-subtitle">Resumen general del sistema</p>
        </div>
        <div class="fecha-hoy">{{ fechaHoy }}</div>
      </div>

      <div class="cards">
        <div class="card card-blue">
          <div class="card-icon"><UsersIcon class="stat-icon" /></div>
          <div class="card-info">
            <p class="card-label">Total Pacientes</p>
            <p class="card-number">{{ stats.pacientes }}</p>
          </div>
        </div>
        <div class="card card-green">
          <div class="card-icon"><UserGroupIcon class="stat-icon" /></div>
          <div class="card-info">
            <p class="card-label">Total Médicos</p>
            <p class="card-number">{{ stats.medicos }}</p>
          </div>
        </div>
        <div class="card card-amber">
          <div class="card-icon"><ClockIcon class="stat-icon" /></div>
          <div class="card-info">
            <p class="card-label">Citas Pendientes</p>
            <p class="card-number">{{ stats.citasPendientes }}</p>
          </div>
        </div>
        <div class="card card-teal">
          <div class="card-icon"><CalendarDaysIcon class="stat-icon" /></div>
          <div class="card-info">
            <p class="card-label">Citas Hoy</p>
            <p class="card-number">{{ stats.citasHoy }}</p>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h2>Acciones rápidas</h2>
        <div class="actions-grid">
          <router-link to="/pacientes" class="action-card">
            <UsersIcon class="action-icon" />
            <span>Gestionar Pacientes</span>
          </router-link>
          <router-link to="/medicos" class="action-card">
            <UserGroupIcon class="action-icon" />
            <span>Gestionar Médicos</span>
          </router-link>
          <router-link to="/citas" class="action-card">
            <CalendarDaysIcon class="action-icon" />
            <span>Ver Citas</span>
          </router-link>
          <router-link to="/disponibilidad" class="action-card">
            <CalendarIcon class="action-icon" />
            <span>Ver Disponibilidad</span>
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { pacienteService } from '../services/paciente.service'
import { medicoService } from '../services/medico.service'
import { citaService } from '../services/cita.service'
import Swal from 'sweetalert2'
import {
  HeartIcon,
  Squares2X2Icon,
  UsersIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ClockIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const stats = ref({ pacientes: 0, medicos: 0, citasPendientes: 0, citasHoy: 0 })

const iniciales = computed(() => {
  const nombre = authStore.usuario?.nombre || ''
  return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const fechaHoy = computed(() => {
  return new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

onMounted(async () => {
  try {
    const [pacientes, medicos, citas] = await Promise.all([
      pacienteService.obtenerTodos(),
      medicoService.obtenerTodos(),
      citaService.obtenerTodas()
    ])
    const hoy = new Date().toDateString()
    stats.value = {
      pacientes: pacientes.length,
      medicos: medicos.length,
      citasPendientes: citas.filter(c => c.estado === 'pendiente').length,
      citasHoy: citas.filter(c => new Date(c.fecha).toDateString() === hoy).length
    }
  } catch (e) {
    console.error(e)
  }
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
.layout { display: flex; min-height: 100vh; background: #f8fafc; }

/* Sidebar */
.sidebar {
  width: 260px;
  background: #0f172a;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  gap: 1.5rem;
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

/* Main */
.main-content { flex: 1; padding: 2rem; }
.page-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 2rem;
}
.page-header h1 { font-size: 1.75rem; font-weight: 600; color: #0f172a; margin: 0; }
.page-subtitle { font-size: 0.9rem; color: #64748b; margin: 0.25rem 0 0; }
.fecha-hoy {
  font-size: 0.85rem; color: #64748b;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  text-transform: capitalize;
}

/* Cards */
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
.card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex; align-items: center; gap: 1rem;
  border: 1px solid #e2e8f0;
  border-left: 4px solid transparent;
}
.card-blue { border-left-color: #2563eb; }
.card-green { border-left-color: #16a34a; }
.card-amber { border-left-color: #d97706; }
.card-teal { border-left-color: #0891b2; }
.card-icon {
  width: 48px; height: 48px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.card-blue .card-icon { background: #dbeafe; }
.card-green .card-icon { background: #dcfce7; }
.card-amber .card-icon { background: #fef3c7; }
.card-teal .card-icon { background: #cffafe; }
.stat-icon { width: 24px; height: 24px; }
.card-blue .stat-icon { color: #2563eb; }
.card-green .stat-icon { color: #16a34a; }
.card-amber .stat-icon { color: #d97706; }
.card-teal .stat-icon { color: #0891b2; }
.card-label { font-size: 0.8rem; color: #64748b; margin: 0; }
.card-number { font-size: 2rem; font-weight: 700; color: #0f172a; margin: 0; }

/* Quick actions */
.quick-actions h2 { font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 1rem; }
.actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
.action-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
  text-decoration: none;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.15s;
}
.action-card:hover { border-color: #2563eb; background: #eff6ff; color: #2563eb; transform: translateY(-2px); }
.action-icon { width: 28px; height: 28px; color: #2563eb; }
</style>