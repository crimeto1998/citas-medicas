<template>
  <div class="layout">
    <SidebarNav />

    <main class="main-content">
      <div class="page-header">
        <div>
          <h1>Citas</h1>
          <p class="page-subtitle">Gestión de citas médicas</p>
        </div>
        <button class="btn-primary" @click="abrirModal()">
          <PlusIcon class="btn-icon" />
          Nueva Cita
        </button>
      </div>

      <div class="search-bar">
        <MagnifyingGlassIcon class="search-icon" />
        <input v-model="busqueda" placeholder="Buscar por paciente, médico o motivo..." />
      </div>

      <div class="tabla-container">
        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Fecha</th>
              <th>Horario</th>
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
              <td>
                <div class="horario">
                  <ClockIcon class="horario-icon" />
                  {{ c.hora }} - {{ c.horaFin }}
                  <span class="duracion-badge">{{ c.duracion }}h</span>
                </div>
              </td>
              <td>{{ c.motivo }}</td>
              <td>
                <select class="estado-select" :class="c.estado"
                  @change="cambiarEstado(c._id, $event.target.value)"
                  :value="c.estado">
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="completada">Completada</option>
                </select>
              </td>
              <td>
                <button v-if="authStore.esAdmin" class="btn-delete" @click="eliminar(c._id)">
                  <TrashIcon class="action-icon" />
                </button>
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
          <div class="modal-header">
            <h2>Nueva Cita</h2>
            <button class="btn-close" @click="cerrarModal"><XMarkIcon class="close-icon" /></button>
          </div>
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
              <div class="form-group">
                <label>Duración</label>
                <select v-model.number="form.duracion" required>
                  <option :value="1">1 hora</option>
                  <option :value="2">2 horas</option>
                  <option :value="3">3 horas</option>
                  <option :value="4">4 horas</option>
                </select>
              </div>
              <div class="form-group full">
                <label>Motivo</label>
                <textarea v-model="form.motivo" rows="2" required></textarea>
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
import { useAuthStore } from '../../stores/auth.store'
import { citaService } from '../../services/cita.service'
import { pacienteService } from '../../services/paciente.service'
import { medicoService } from '../../services/medico.service'
import SidebarNav from '../../components/SidebarNav.vue'
import Swal from 'sweetalert2'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

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

onMounted(async () => { await cargarDatos() })

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
  form.value = { paciente: '', medico: '', fecha: '', hora: '', duracion: 1, motivo: '', notas: '' }
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
    Swal.fire({ title: 'Cita agendada', icon: 'success', timer: 1500, showConfirmButton: false })
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al guardar'
  }
}

async function cambiarEstado(id, estado) {
  try {
    await citaService.actualizarEstado(id, estado)
    await cargarDatos()
  } catch (e) { console.error(e) }
}

async function eliminar(id) {
  const result = await Swal.fire({
    title: '¿Eliminar cita?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#2563eb'
  })
  if (result.isConfirmed) {
    await citaService.eliminar(id)
    await cargarDatos()
  }
}
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; background: #f8fafc; }
.main-content { flex: 1; padding: 2rem; overflow-x: auto; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.75rem; font-weight: 600; color: #0f172a; margin: 0; }
.page-subtitle { font-size: 0.9rem; color: #64748b; margin: 0.25rem 0 0; }
.search-bar { display: flex; align-items: center; gap: 0.75rem; background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.6rem 1rem; margin-bottom: 1rem; }
.search-bar input { border: none; outline: none; font-size: 0.95rem; width: 100%; background: transparent; color: #374151; }
.search-icon { width: 18px; height: 18px; color: #94a3b8; flex-shrink: 0; }
.tabla-container { background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
table { width: 100%; border-collapse: collapse; }
th { background: #f8fafc; padding: 0.875rem 1rem; text-align: left; color: #64748b; font-weight: 500; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
td { padding: 1rem; border-top: 1px solid #f1f5f9; color: #374151; font-size: 0.95rem; }
.horario { display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; }
.horario-icon { width: 14px; height: 14px; color: #64748b; }
.duracion-badge { background: #f1f5f9; color: #64748b; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.78rem; }
.sin-datos { text-align: center; color: #9ca3af; padding: 2rem; }
.btn-primary { display: flex; align-items: center; gap: 0.4rem; background: #2563eb; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
.btn-primary:hover { background: #1d4ed8; }
.btn-icon { width: 16px; height: 16px; }
.btn-delete { background: #fee2e2; color: #dc2626; border: none; padding: 0.4rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; }
.btn-delete:hover { background: #fecaca; }
.action-icon { width: 16px; height: 16px; }
.estado-select { padding: 0.3rem 0.5rem; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 0.85rem; cursor: pointer; font-weight: 500; }
.estado-select.pendiente { background: #fef3c7; color: #d97706; }
.estado-select.confirmada { background: #dcfce7; color: #16a34a; }
.estado-select.cancelada { background: #fee2e2; color: #dc2626; }
.estado-select.completada { background: #dbeafe; color: #2563eb; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; padding: 2rem; border-radius: 12px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.modal-header h2 { color: #0f172a; margin: 0; font-size: 1.2rem; }
.btn-close { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0.25rem; border-radius: 6px; display: flex; }
.btn-close:hover { background: #f1f5f9; }
.close-icon { width: 20px; height: 20px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; }
.form-group.full { grid-column: span 2; }
label { font-size: 0.85rem; color: #374151; margin-bottom: 0.3rem; font-weight: 500; }
input, select, textarea { padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.95rem; color: #374151; }
input:focus, select:focus, textarea:focus { outline: none; border-color: #2563eb; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem; }
.btn-cancel { background: #f1f5f9; color: #374151; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; }
.error { color: #ef4444; font-size: 0.9rem; margin-top: 0.5rem; }
</style>