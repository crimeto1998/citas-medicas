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
        <h1>🗓️ Disponibilidad de Médicos</h1>
      </div>

      <!-- Filtros -->
      <div class="filtros">
        <div class="filtro-group">
          <label>Médico</label>
          <select v-model="medicoSeleccionado" @change="cargarSemana">
            <option value="">Seleccionar médico...</option>
            <option v-for="m in medicos" :key="m._id" :value="m._id">
              {{ m.nombre }} {{ m.apellido }} — {{ m.especialidad }}
            </option>
          </select>
        </div>
        <div class="filtro-group">
          <label>Semana</label>
          <div class="semana-nav">
            <button @click="cambiarSemana(-1)">←</button>
            <span>{{ labelSemana }}</span>
            <button @click="cambiarSemana(1)">→</button>
          </div>
        </div>
      </div>

      <!-- Calendario semanal -->
      <div v-if="medicoSeleccionado" class="calendario">
        <div class="cal-header">
          <div class="hora-col"></div>
          <div v-for="dia in diasSemana" :key="dia.fecha" class="dia-col"
            :class="{ hoy: dia.esHoy }">
            <div class="dia-nombre">{{ dia.nombre }}</div>
            <div class="dia-fecha">{{ dia.label }}</div>
          </div>
        </div>

        <div class="cal-body">
          <div v-for="hora in horas" :key="hora" class="cal-fila">
            <div class="hora-col">{{ hora }}</div>
            <div v-for="dia in diasSemana" :key="dia.fecha" class="dia-celda"
              :class="{ 'pasado': dia.esPasado }"
              @click="abrirModalDesdeCalendario(dia.fecha, hora)">
              <div v-for="cita in getCitasEnHora(dia.fecha, hora)" :key="cita._id"
                class="cita-bloque"
                :class="cita.estado"
                :style="{ height: (cita.duracion * 60) + 'px' }"
                @click.stop="verDetalle(cita)">
                <span class="cita-hora">{{ cita.hora }} - {{ cita.horaFin }}</span>
                <span class="cita-paciente">{{ cita.paciente?.nombre }} {{ cita.paciente?.apellido }}</span>
                <span class="cita-duracion">{{ cita.duracion }}h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="sin-medico">
        <p>👆 Selecciona un médico para ver su disponibilidad semanal</p>
      </div>

      <!-- Modal nueva cita -->
      <div v-if="modalNueva" class="modal-overlay" @click.self="cerrarModal">
        <div class="modal">
          <h2>📅 Nueva Cita</h2>
          <form @submit.prevent="guardarCita">
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
                <input :value="nombreMedicoSeleccionado" disabled />
              </div>
              <div class="form-group">
                <label>Fecha</label>
                <input v-model="form.fecha" type="date" required />
              </div>
              <div class="form-group">
                <label>Hora inicio</label>
                <input v-model="form.hora" type="time" required @change="verificarDisponibilidad" />
              </div>
              <div class="form-group">
                <label>Duración</label>
                <select v-model.number="form.duracion" required @change="verificarDisponibilidad">
                  <option :value="1">1 hora</option>
                  <option :value="2">2 horas</option>
                  <option :value="3">3 horas</option>
                  <option :value="4">4 horas</option>
                </select>
              </div>
              <div class="form-group">
                <label>Hora fin (estimada)</label>
                <input :value="horaFinEstimada" disabled class="disabled-input" />
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

            <!-- Alerta de disponibilidad -->
            <div v-if="alertaDisponibilidad" class="alerta" :class="alertaDisponibilidad.tipo">
              {{ alertaDisponibilidad.mensaje }}
            </div>

            <p v-if="errorCita" class="error">{{ errorCita }}</p>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="cerrarModal">Cancelar</button>
              <button type="submit" class="btn-primary" :disabled="alertaDisponibilidad?.tipo === 'ocupado'">
                Guardar Cita
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal detalle cita -->
      <div v-if="modalDetalle" class="modal-overlay" @click.self="modalDetalle = false">
        <div class="modal modal-detalle">
          <h2>📋 Detalle de Cita</h2>
          <div class="detalle-grid">
            <div class="detalle-item">
              <span class="detalle-label">Paciente</span>
              <span>{{ citaDetalle?.paciente?.nombre }} {{ citaDetalle?.paciente?.apellido }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Médico</span>
              <span>{{ citaDetalle?.medico?.nombre }} {{ citaDetalle?.medico?.apellido }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Fecha</span>
              <span>{{ formatearFecha(citaDetalle?.fecha) }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Horario</span>
              <span>{{ citaDetalle?.hora }} - {{ citaDetalle?.horaFin }} ({{ citaDetalle?.duracion }}h)</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Motivo</span>
              <span>{{ citaDetalle?.motivo }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Estado</span>
              <span class="badge" :class="citaDetalle?.estado">{{ citaDetalle?.estado }}</span>
            </div>
            <div v-if="citaDetalle?.notas" class="detalle-item full">
              <span class="detalle-label">Notas</span>
              <span>{{ citaDetalle?.notas }}</span>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="modalDetalle = false">Cerrar</button>
          </div>
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
import { medicoService } from '../../services/medico.service'
import { pacienteService } from '../../services/paciente.service'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()
const medicos = ref([])
const pacientes = ref([])
const medicoSeleccionado = ref('')
const citasSemana = ref([])
const modalNueva = ref(false)
const modalDetalle = ref(false)
const citaDetalle = ref(null)
const errorCita = ref('')
const alertaDisponibilidad = ref(null)
const form = ref({ paciente: '', medico: '', fecha: '', hora: '', duracion: 1, motivo: '', notas: '' })

const horas = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']

const fechaBase = ref(new Date())

const diasSemana = computed(() => {
  const dias = []
  const nombres = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
  const inicio = new Date(fechaBase.value)
  const diaSemana = inicio.getDay()
  inicio.setDate(inicio.getDate() - diaSemana + 1)

  for (let i = 0; i < 6; i++) {
    const d = new Date(inicio)
    d.setDate(inicio.getDate() + i)
    const hoy = new Date()
    dias.push({
      nombre: nombres[d.getDay()],
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      fecha: d.toISOString().split('T')[0],
      esHoy: d.toDateString() === hoy.toDateString(),
      esPasado: d < new Date(hoy.setHours(0,0,0,0))
    })
  }
  return dias
})

const labelSemana = computed(() => {
  const primer = diasSemana.value[0]
  const ultimo = diasSemana.value[5]
  return `${primer.label} — ${ultimo.label}`
})

const nombreMedicoSeleccionado = computed(() => {
  const m = medicos.value.find(m => m._id === medicoSeleccionado.value)
  return m ? `${m.nombre} ${m.apellido}` : ''
})

const horaFinEstimada = computed(() => {
  if (!form.value.hora || !form.value.duracion) return ''
  const [h, m] = form.value.hora.split(':').map(Number)
  const total = h * 60 + m + form.value.duracion * 60
  const hFin = Math.floor(total / 60) % 24
  const mFin = total % 60
  return `${String(hFin).padStart(2, '0')}:${String(mFin).padStart(2, '0')}`
})

onMounted(async () => {
  const [m, p] = await Promise.all([medicoService.obtenerTodos(), pacienteService.obtenerTodos()])
  medicos.value = m
  pacientes.value = p
})

async function cargarSemana() {
  if (!medicoSeleccionado.value) return
  const todasLasCitas = []
  for (const dia of diasSemana.value) {
    try {
      const citas = await citaService.obtenerDisponibilidad(medicoSeleccionado.value, dia.fecha)
      todasLasCitas.push(...citas)
    } catch (e) {}
  }
  citasSemana.value = todasLasCitas
}

function getCitasEnHora(fecha, hora) {
  return citasSemana.value.filter(c => {
    const fechaCita = c.fecha?.split('T')[0]
    return fechaCita === fecha && c.hora === hora
  })
}

async function cambiarSemana(direccion) {
  const nueva = new Date(fechaBase.value)
  nueva.setDate(nueva.getDate() + direccion * 7)
  fechaBase.value = nueva
  await cargarSemana()
}

function abrirModalDesdeCalendario(fecha, hora) {
  if (!medicoSeleccionado.value) return
  form.value = {
    paciente: '',
    medico: medicoSeleccionado.value,
    fecha,
    hora,
    duracion: 1,
    motivo: '',
    notas: ''
  }
  alertaDisponibilidad.value = null
  errorCita.value = ''
  verificarDisponibilidad()
  modalNueva.value = true
}

function verificarDisponibilidad() {
  if (!form.value.hora || !form.value.duracion || !form.value.fecha) return
  const horaFin = horaFinEstimada.value
  const toMin = h => { const [hh, mm] = h.split(':').map(Number); return hh * 60 + mm }

  const conflicto = citasSemana.value.find(c => {
    const fechaCita = c.fecha?.split('T')[0]
    if (fechaCita !== form.value.fecha) return false
    return toMin(form.value.hora) < toMin(c.horaFin) && toMin(horaFin) > toMin(c.hora)
  })

  if (conflicto) {
    alertaDisponibilidad.value = {
      tipo: 'ocupado',
      mensaje: `⛔ Horario ocupado: el médico tiene cita de ${conflicto.hora} a ${conflicto.horaFin}`
    }
  } else if (form.value.hora) {
    alertaDisponibilidad.value = {
      tipo: 'libre',
      mensaje: `✅ Horario disponible de ${form.value.hora} a ${horaFin}`
    }
  }
}

async function guardarCita() {
  try {
    errorCita.value = ''
    await citaService.crear({ ...form.value, medico: medicoSeleccionado.value })
    await cargarSemana()
    cerrarModal()
    Swal.fire({ title: '¡Cita agendada!', icon: 'success', timer: 1500, showConfirmButton: false })
  } catch (e) {
    errorCita.value = e.response?.data?.message || 'Error al guardar la cita'
  }
}

function cerrarModal() {
  modalNueva.value = false
  alertaDisponibilidad.value = null
  errorCita.value = ''
}

function verDetalle(cita) {
  citaDetalle.value = cita
  modalDetalle.value = true
}

function formatearFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CO')
}

async function handleLogout() {
  const result = await Swal.fire({
    title: '¿Cerrar sesión?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, salir',
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
.layout { display: flex; min-height: 100vh; }
.sidebar { width: 250px; background: #1e3a5f; color: white; display: flex; flex-direction: column; padding: 1.5rem 1rem; }
.sidebar-header { margin-bottom: 2rem; }
.sidebar-header h2 { font-size: 1.1rem; margin-bottom: 0.3rem; }
.sidebar-header p { font-size: 0.9rem; color: #93c5fd; }
.rol { background: #2563eb; padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.75rem; }
nav { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
nav a { color: #cbd5e1; text-decoration: none; padding: 0.7rem 1rem; border-radius: 8px; }
nav a:hover, nav a.router-link-active { background: #2563eb; color: white; }
.logout { background: #ef4444; color: white; border: none; padding: 0.7rem; border-radius: 8px; cursor: pointer; width: 100%; }
.main-content { flex: 1; padding: 2rem; overflow-x: auto; }
.header { margin-bottom: 1.5rem; }
.header h1 { color: #1e3a5f; }
.filtros { display: flex; gap: 1.5rem; margin-bottom: 1.5rem; align-items: flex-end; flex-wrap: wrap; }
.filtro-group { display: flex; flex-direction: column; gap: 0.3rem; }
.filtro-group label { font-size: 0.85rem; color: #374151; font-weight: 500; }
.filtro-group select { padding: 0.5rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.95rem; min-width: 280px; }
.semana-nav { display: flex; align-items: center; gap: 0.5rem; }
.semana-nav button { background: #f1f5f9; border: 1px solid #d1d5db; border-radius: 8px; padding: 0.4rem 0.8rem; cursor: pointer; font-size: 1rem; }
.semana-nav span { font-size: 0.95rem; font-weight: 500; color: #1e3a5f; min-width: 130px; text-align: center; }
.calendario { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); min-width: 700px; }
.cal-header { display: grid; grid-template-columns: 70px repeat(6, 1fr); background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.hora-col { padding: 0.75rem; font-size: 0.8rem; color: #9ca3af; }
.dia-col { padding: 0.75rem; text-align: center; border-left: 1px solid #e2e8f0; }
.dia-col.hoy { background: #dbeafe; }
.dia-nombre { font-size: 0.8rem; color: #6b7280; }
.dia-fecha { font-size: 0.95rem; font-weight: 600; color: #1e3a5f; }
.dia-col.hoy .dia-fecha { color: #2563eb; }
.cal-body { }
.cal-fila { display: grid; grid-template-columns: 70px repeat(6, 1fr); border-bottom: 1px solid #f1f5f9; min-height: 60px; }
.hora-col { padding: 0.5rem; font-size: 0.75rem; color: #9ca3af; display: flex; align-items: flex-start; justify-content: center; padding-top: 0.5rem; }
.dia-celda { border-left: 1px solid #f1f5f9; padding: 2px; position: relative; cursor: pointer; min-height: 60px; transition: background 0.15s; }
.dia-celda:hover { background: #f0f7ff; }
.dia-celda.pasado { background: #fafafa; cursor: default; }
.cita-bloque { border-radius: 6px; padding: 4px 6px; margin: 1px; display: flex; flex-direction: column; gap: 1px; overflow: hidden; cursor: pointer; position: absolute; left: 2px; right: 2px; z-index: 2; min-height: 55px; }
.cita-bloque.pendiente { background: #fef3c7; border-left: 3px solid #d97706; }
.cita-bloque.confirmada { background: #dcfce7; border-left: 3px solid #16a34a; }
.cita-bloque.cancelada { background: #fee2e2; border-left: 3px solid #dc2626; opacity: 0.6; }
.cita-bloque.completada { background: #dbeafe; border-left: 3px solid #2563eb; }
.cita-hora { font-size: 0.7rem; font-weight: 600; color: #374151; }
.cita-paciente { font-size: 0.72rem; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cita-duracion { font-size: 0.68rem; color: #6b7280; }
.sin-medico { text-align: center; padding: 4rem; color: #9ca3af; font-size: 1.1rem; background: white; border-radius: 12px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; padding: 2rem; border-radius: 12px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal h2 { margin-bottom: 1.5rem; color: #1e3a5f; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; }
.form-group.full { grid-column: span 2; }
label { font-size: 0.9rem; color: #374151; margin-bottom: 0.3rem; }
input, select, textarea { padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.95rem; }
.disabled-input { background: #f9fafb; color: #6b7280; }
.alerta { padding: 0.75rem 1rem; border-radius: 8px; margin-top: 1rem; font-size: 0.9rem; font-weight: 500; }
.alerta.libre { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
.alerta.ocupado { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem; }
.btn-primary { background: #2563eb; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; }
.btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
.btn-cancel { background: #f1f5f9; color: #374151; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; }
.error { color: #ef4444; font-size: 0.9rem; margin-top: 0.5rem; }
.detalle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
.detalle-item { display: flex; flex-direction: column; gap: 0.2rem; }
.detalle-item.full { grid-column: span 2; }
.detalle-label { font-size: 0.8rem; color: #9ca3af; text-transform: uppercase; }
.badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.85rem; }
.badge.pendiente { background: #fef3c7; color: #d97706; }
.badge.confirmada { background: #dcfce7; color: #16a34a; }
.badge.cancelada { background: #fee2e2; color: #dc2626; }
.badge.completada { background: #dbeafe; color: #2563eb; }
</style>