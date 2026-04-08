import api from './api'

export const pacienteService = {
  async obtenerTodos() {
    const { data } = await api.get('/pacientes')
    return data
  },
  async obtenerUno(id) {
    const { data } = await api.get(`/pacientes/${id}`)
    return data
  },
  async crear(datos) {
    const { data } = await api.post('/pacientes', datos)
    return data
  },
  async actualizar(id, datos) {
    const { data } = await api.put(`/pacientes/${id}`, datos)
    return data
  },
  async eliminar(id) {
    const { data } = await api.delete(`/pacientes/${id}`)
    return data
  }
}