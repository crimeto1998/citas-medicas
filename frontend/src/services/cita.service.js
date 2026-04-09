import api from './api'

export const citaService = {
  async obtenerTodas() {
    const { data } = await api.get('/citas')
    return data
  },
  async obtenerUna(id) {
    const { data } = await api.get(`/citas/${id}`)
    return data
  },
  async crear(datos) {
    const { data } = await api.post('/citas', datos)
    return data
  },
  async actualizarEstado(id, estado) {
    const { data } = await api.patch(`/citas/${id}/estado`, { estado })
    return data
  },
  async eliminar(id) {
    const { data } = await api.delete(`/citas/${id}`)
    return data
  },
  async obtenerDisponibilidad(medicoId, fecha) {
    const { data } = await api.get(`/citas/disponibilidad?medicoId=${medicoId}&fecha=${fecha}`)
    return data
  }
}