<template>
  <div class="layout">
    <SidebarNav />

    <main class="main-content">
      <div class="page-header">
        <div>
          <h1>Pacientes</h1>
          <p class="page-subtitle">Gestión de pacientes registrados</p>
        </div>
        <button class="btn-primary" @click="abrirModal()">
          <PlusIcon class="btn-icon" />
          Nuevo Paciente
        </button>
      </div>

      <div class="search-bar">
        <MagnifyingGlassIcon class="search-icon" />
        <input v-model="busqueda" placeholder="Buscar por nombre, apellido o documento..." />
      </div>

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
              <td>
                <div class="paciente-nombre">
                  <div class="avatar">{{ p.nombre[0] }}{{ p.apellido[0] }}</div>
                  {{ p.nombre }} {{ p.apellido }}
                </div>
              </td>
              <td>{{ p.documento }}</td>
              <td>{{ p.email }}</td>
              <td>{{ p.telefono }}</td>
              <td>
                <div class="acciones">
                  <button class="btn-edit" @click="abrirModal(p)">
                    <PencilIcon class="action-icon" />
                  </button>
                  <button v-if="authStore.esAdmin" class="btn-delete" @click="eliminar(p._id)">
                    <TrashIcon class="action-icon" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="pacientesFiltrados.length === 0">
              <td colspan="5" class="sin-datos">No hay pacientes registrados</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="modal" class="modal-overlay" @click.self="cerrarModal">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ editando ? 'Editar' : 'Nuevo' }} Paciente</h2>
            <button class="btn-close" @click="cerrarModal"><XMarkIcon class="close-icon" /></button>
          </div>
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
import { useAuthStore } from '../../stores/auth.store'
import { pacienteService } from '../../services/paciente.service'
import SidebarNav from '../../components/SidebarNav.vue'
import Swal from 'sweetalert2'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

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
  const result = await Swal.fire({
    title: '¿Eliminar paciente?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#2563eb'
  })
  if (result.isConfirmed) {
    await pacienteService.eliminar(id)
    pacientes.value = await pacienteService.obtenerTodos()
  }
}
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; background: #f8fafc; }
.main-content { flex: 1; padding: 2rem; }
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
.paciente-nombre { display: flex; align-items: center; gap: 0.75rem; }
.avatar { width: 34px; height: 34px; background: #dbeafe; color: #1d4ed8; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; flex-shrink: 0; }
.sin-datos { text-align: center; color: #9ca3af; padding: 2rem; }
.acciones { display: flex; gap: 0.4rem; }
.btn-primary { display: flex; align-items: center; gap: 0.4rem; background: #2563eb; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
.btn-primary:hover { background: #1d4ed8; }
.btn-icon { width: 16px; height: 16px; }
.btn-edit { background: #fef3c7; color: #d97706; border: none; padding: 0.4rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; }
.btn-edit:hover { background: #fde68a; }
.btn-delete { background: #fee2e2; color: #dc2626; border: none; padding: 0.4rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; }
.btn-delete:hover { background: #fecaca; }
.action-icon { width: 16px; height: 16px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; padding: 2rem; border-radius: 12px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.modal-header h2 { color: #0f172a; margin: 0; font-size: 1.2rem; }
.btn-close { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0.25rem; border-radius: 6px; display: flex; }
.btn-close:hover { background: #f1f5f9; color: #374151; }
.close-icon { width: 20px; height: 20px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; }
.form-group.full { grid-column: span 2; }
label { font-size: 0.85rem; color: #374151; margin-bottom: 0.3rem; font-weight: 500; }
input, textarea { padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.95rem; color: #374151; }
input:focus, textarea:focus { outline: none; border-color: #2563eb; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem; }
.btn-cancel { background: #f1f5f9; color: #374151; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; }
.btn-cancel:hover { background: #e2e8f0; }
.error { color: #ef4444; font-size: 0.9rem; margin-top: 0.5rem; }
</style>