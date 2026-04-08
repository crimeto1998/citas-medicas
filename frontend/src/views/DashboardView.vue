<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>🏥 Citas Médicas</h2>
        <p>{{ authStore.usuario?.nombre }}</p>
        <span class="rol">{{ authStore.usuario?.rol }}</span>
      </div>
      <nav>
        <router-link to="/">📊 Dashboard</router-link>
        <router-link to="/pacientes">👥 Pacientes</router-link>
        <router-link to="/medicos">👨‍⚕️ Médicos</router-link>
        <router-link to="/citas">📅 Citas</router-link>
      </nav>
      <button class="logout" @click="handleLogout">🚪 Cerrar Sesión</button>
    </aside>

    <!-- Contenido -->
    <main class="main-content">
      <h1>Dashboard</h1>
      <div class="cards">
        <div class="card azul">
          <h3>👥 Pacientes</h3>
          <p class="numero">{{ stats.pacientes }}</p>
        </div>
        <div class="card verde">
          <h3>👨‍⚕️ Médicos</h3>
          <p class="numero">{{ stats.medicos }}</p>
        </div>
        <div class="card amarillo">
          <h3>📅 Citas Pendientes</h3>
          <p class="numero">{{ stats.citasPendientes }}</p>
        </div>
        <div class="card rojo">
          <h3>✅ Citas Hoy</h3>
          <p class="numero">{{ stats.citasHoy }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { pacienteService } from '../services/paciente.service'
import { medicoService } from '../services/medico.service'
import { citaService } from '../services/cita.service'

const router = useRouter()
const authStore = useAuthStore()

const stats = ref({ pacientes: 0, medicos: 0, citasPendientes: 0, citasHoy: 0 })

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

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; }
.sidebar {
  width: 250px;
  background: #1e3a5f;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
}
.sidebar-header { margin-bottom: 2rem; }
.sidebar-header h2 { font-size: 1.1rem; margin-bottom: 0.3rem; }
.sidebar-header p { font-size: 0.9rem; color: #93c5fd; }
.rol {
  background: #2563eb;
  padding: 0.2rem 0.5rem;
  border-radius: 20px;
  font-size: 0.75rem;
}
nav { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
nav a {
  color: #cbd5e1;
  text-decoration: none;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  transition: background 0.2s;
}
nav a:hover, nav a.router-link-active {
  background: #2563eb;
  color: white;
}
.logout {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.7rem;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
}
.logout:hover { background: #dc2626; }
.main-content { flex: 1; padding: 2rem; }
.main-content h1 { margin-bottom: 1.5rem; color: #1e3a5f; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
.card {
  padding: 1.5rem;
  border-radius: 12px;
  color: white;
}
.card h3 { font-size: 1rem; margin-bottom: 0.5rem; }
.numero { font-size: 2.5rem; font-weight: bold; }
.azul { background: #2563eb; }
.verde { background: #16a34a; }
.amarillo { background: #d97706; }
.rojo { background: #dc2626; }
</style>