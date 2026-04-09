<template>
  <div class="layout">
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
        <router-link to="/disponibilidad">🗓️ Disponibilidad</router-link>
      </nav>
      <button class="logout" @click="handleLogout">🚪 Cerrar Sesión</button>
    </aside>

    <main class="main-content">
      <div class="header">
        <h1>👥 Pacientes</h1>
        <button class="btn-primary" @click="abrirModal()">+ Nuevo Paciente</button>
      </div>

      <!-- Buscador -->
      <input v-model="busqueda" class="buscador" placeholder="🔍 Buscar paciente..." />

      <!-- Tabla -->
      <div class="tabla-container">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in pacientesFiltrados" :key="p._id">
              <td>{{ p.nombre }} {{ p.apellido }}</td>
              <td>{{ p.documento }}</td>
              <td>{{ p.email }}</td>
              <td>{{ p.telefono }}</td>
              <td>
                <button class="btn-edit" @click="abrirModal(p)">✏️</button>
                <button v-if="authStore.esAdmin" class="btn-delete" @click="eliminar(p._id)">🗑️</button>
              </td>
            </tr>
            <tr v-if="pacientesFiltrados.length === 0">
              <td colspan="5" class="sin-datos">No hay pacientes registrados</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div v-if="modal" class="modal-overlay" @click.self="cerrarModal">
        <div class="modal">
          <h2>{{ editando ? 'Editar' : 'Nuevo' }} Paciente</h2>
          <form @submit.prevent="guardar">
            <div class="form-grid">
              <div class="form-group">
                <label>Nombre</label>
                <input v-model="form.nombre" required />
              </div>
              <div class="form-group">
                <label>Apellido</label>
                <input v-model="form.apellido" required />
              </div>
              <div class="form-group">
                <label>Documento</label>
                <input v-model="form.documento" required />
              </div>
              <div class="form-group">
                <label>Teléfono</label>
                <input v-model="form.telefono" required />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input v-model="form.email" type="email" required />
              </div>
              <div class="form-group">
                <label>Fecha Nacimiento</label>
                <input v-model="form.fechaNacimiento" type="date" required />
              </div>
              <div class="form-group full">
                <label>Historial Médico</label>
                <textarea v-model="form.historialMedico" rows="3"></textarea>
              </div>
            </div>
            <p v-if="error" class="error">{{ error }}</p>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="cerrarModal">Cancelar</button>
              <button type="submit" class="btn-primary">{{ editando ? 'Actualizar' : 'Guardar' }}</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store'
import { pacienteService } from '../../services/paciente.service'

const router = useRouter()
const authStore = useAuthStore()
const pacientes = ref([])
const busqueda = ref('')
const modal = ref(false)
const editando = ref(null)
const error = ref('')
const form = ref({})

const pacientesFiltrados = computed(() => {
  return pacientes.value.filter(p =>
    `${p.nombre} ${p.apellido} ${p.documento}`.toLowerCase().includes(busqueda.value.toLowerCase())
  )
})

onMounted(async () => {
  pacientes.value = await pacienteService.obtenerTodos()
})

function abrirModal(paciente = null) {
  editando.value = paciente?._id || null
  form.value = paciente ? {
    nombre: paciente.nombre,
    apellido: paciente.apellido,
    email: paciente.email,
    telefono: paciente.telefono,
    documento: paciente.documento,
    fechaNacimiento: paciente.fechaNacimiento?.split('T')[0],
    historialMedico: paciente.historialMedico
  } : {}
  modal.value = true
}

function cerrarModal() {
  modal.value = false
  error.value = ''
}

async function guardar() {
  try {
    if (editando.value) {
      await pacienteService.actualizar(editando.value, form.value)
    } else {
      await pacienteService.crear(form.value)
    }
    pacientes.value = await pacienteService.obtenerTodos()
    cerrarModal()
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al guardar'
  }
}

async function eliminar(id) {
  if (confirm('¿Estás seguro de eliminar este paciente?')) {
    await pacienteService.eliminar(id)
    pacientes.value = await pacienteService.obtenerTodos()
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; }
.sidebar {
  width: 250px; background: #1e3a5f; color: white;
  display: flex; flex-direction: column; padding: 1.5rem 1rem;
}
.sidebar-header { margin-bottom: 2rem; }
.sidebar-header h2 { font-size: 1.1rem; margin-bottom: 0.3rem; }
.sidebar-header p { font-size: 0.9rem; color: #93c5fd; }
.rol { background: #2563eb; padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.75rem; }
nav { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
nav a { color: #cbd5e1; text-decoration: none; padding: 0.7rem 1rem; border-radius: 8px; }
nav a:hover, nav a.router-link-active { background: #2563eb; color: white; }
.logout { background: #ef4444; color: white; border: none; padding: 0.7rem; border-radius: 8px; cursor: pointer; }
.main-content { flex: 1; padding: 2rem; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.header h1 { color: #1e3a5f; }
.buscador { width: 100%; padding: 0.6rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; margin-bottom: 1rem; font-size: 1rem; }
.tabla-container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
table { width: 100%; border-collapse: collapse; }
th { background: #f8fafc; padding: 1rem; text-align: left; color: #374151; font-weight: 600; }
td { padding: 1rem; border-top: 1px solid #f1f5f9; color: #374151; }
.sin-datos { text-align: center; color: #9ca3af; }
.btn-primary { background: #2563eb; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; }
.btn-primary:hover { background: #1d4ed8; }
.btn-edit { background: #f59e0b; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer; margin-right: 0.3rem; }
.btn-delete { background: #ef4444; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; padding: 2rem; border-radius: 12px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal h2 { margin-bottom: 1.5rem; color: #1e3a5f; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; }
.form-group.full { grid-column: span 2; }
label { font-size: 0.9rem; color: #374151; margin-bottom: 0.3rem; }
input, textarea { padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.95rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem; }
.btn-cancel { background: #f1f5f9; color: #374151; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; }
.error { color: #ef4444; font-size: 0.9rem; margin-top: 0.5rem; }
</style>