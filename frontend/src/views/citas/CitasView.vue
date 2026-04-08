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
      </nav>
      <button class="logout" @click="handleLogout">🚪 Cerrar Sesión</button>
    </aside>

    <main class="main-content">
      <div class="header">
        <h1>📅 Citas</h1>
        <button class="btn-primary" @click="abrirModal()">+ Nueva Cita</button>
      </div>

      <input v-model="busqueda" class="buscador" placeholder="🔍 Buscar cita..." />

      <div class="tabla-container">
        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in citasFiltradas" :key="c._id">
              <td>{{ c.paciente?.nombre }} {{ c.paciente?.apellido }}</td>
              <td>{{ c.medico?.nombre }} {{ c.medico?.apellido }}</td>
              <td>{{ formatearFecha(c.fecha) }}</td>
              <td>{{ c.hora }}</td>
              <td>{{ c.motivo }}</td>
              <td>
                <select class="estado-select" :class="c.estado" @change="cambiarEstado(c._id, $event.target.value)" :value="c.estado">
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="completada">Completada</option>
                </select>
              </td>
              <td>
                <button v-if="authStore.esAdmin" class="btn-delete" @click="eliminar(c._id)">🗑️</button>
              </td>
            </tr>
            <tr v-if="citasFiltradas.length === 0">
              <td colspan="7" class="sin-datos">No hay citas registradas</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="modal" class="modal-overlay" @click.self="cerrarModal">
        <div class="modal">
          <h2>Nueva Cita</h2>
          <form @submit.prevent="guardar">
            <div class="form-grid">
              <div class="form-group">
                <label>Paciente</label>
                <select v-model="form.paciente" required>
                  <option value="">Seleccionar...</option>
                  <option v-for="p in pacientes" :key="p._id" :value="p._id">
                    {{ p.nombre }} {{ p.apellido }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Médico</label>
                <select v-model="form.medico" required>
                  <option value="">Seleccionar...</option>
                  <option v-for="m in medicos" :key="m._id" :value="m._id">
                    {{ m.nombre }} {{ m.apellido }} - {{ m.especialidad }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Fecha</label>
                <input v-model="form.fecha" type="date" required />
              </div>
              <div class="form-group">
                <label>Hora</label>
                <input v-model="form.hora" type="time" required />
              </div>
              <div class="form-group full">
                <label>Motivo</label>
                <textarea v-model="form.motivo" rows="3" required></textarea>
              </div>
              <div class="form-group full">
                <label>Notas</label>
                <textarea v-model="form.notas" rows="2"></textarea>
              </div>
            </div>
            <p v-if="error" class="error">{{ error }}</p>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="cerrarModal">Cancelar</button>
              <button type="submit" class="btn-primary">Guardar</button>
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
import { citaService } from '../../services/cita.service'
import { pacienteService } from '../../services/paciente.service'
import { medicoService } from '../../services/medico.service'

const router = useRouter()
const authStore = useAuthStore()
const citas = ref([])
const pacientes = ref([])
const medicos = ref([])
const busqueda = ref('')
const modal = ref(false)
const error = ref('')
const form = ref({})

const citasFiltradas = computed(() => {
  return citas.value.filter(c => {
    const texto = `${c.paciente?.nombre} ${c.paciente?.apellido} ${c.medico?.nombre} ${c.motivo}`.toLowerCase()
    return texto.includes(busqueda.value.toLowerCase())
  })
})

onMounted(async () => {
  await cargarDatos()
})

async function cargarDatos() {
  const [c, p, m] = await Promise.all([
    citaService.obtenerTodas(),
    pacienteService.obtenerTodos(),
    medicoService.obtenerTodos()
  ])
  citas.value = c
  pacientes.value = p
  medicos.value = m
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-CO')
}

function abrirModal() {
  form.value = { paciente: '', medico: '', fecha: '', hora: '', motivo: '', notas: '' }
  modal.value = true
}

function cerrarModal() {
  modal.value = false
  error.value = ''
}

async function guardar() {
  try {
    await citaService.crear(form.value)
    await cargarDatos()
    cerrarModal()
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al guardar'
  }
}

async function cambiarEstado(id, estado) {
  try {
    await citaService.actualizarEstado(id, estado)
    await cargarDatos()
  } catch (e) {
    console.error(e)
  }
}

async function eliminar(id) {
  if (confirm('¿Estás seguro de eliminar esta cita?')) {
    await citaService.eliminar(id)
    await cargarDatos()
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; }
.sidebar { width: 250px; background: #1e3a5f; color: white; display: flex; flex-direction: column; padding: 1.5rem 1rem; }
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
td { padding: 0.8rem 1rem; border-top: 1px solid #f1f5f9; color: #374151; }
.sin-datos { text-align: center; color: #9ca3af; }
.estado-select { padding: 0.3rem 0.5rem; border-radius: 6px; border: 1px solid #d1d5db; font-size: 0.85rem; cursor: pointer; }
.estado-select.pendiente { background: #fef3c7; color: #d97706; }
.estado-select.confirmada { background: #dcfce7; color: #16a34a; }
.estado-select.cancelada { background: #fee2e2; color: #dc2626; }
.estado-select.completada { background: #dbeafe; color: #2563eb; }
.btn-primary { background: #2563eb; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; }
.btn-primary:hover { background: #1d4ed8; }
.btn-delete { background: #ef4444; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; padding: 2rem; border-radius: 12px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal h2 { margin-bottom: 1.5rem; color: #1e3a5f; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; }
.form-group.full { grid-column: span 2; }
label { font-size: 0.9rem; color: #374151; margin-bottom: 0.3rem; }
input, select, textarea { padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.95rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem; }
.btn-cancel { background: #f1f5f9; color: #374151; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; }
.error { color: #ef4444; font-size: 0.9rem; margin-top: 0.5rem; }
</style>