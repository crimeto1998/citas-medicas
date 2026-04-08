import api from './api'

export const medicoService = {
  async obtenerTodos() {
    const { data } = await api.get('/medicos')
    return data
  },
  async obtenerUno(id) {
    const { data } = await api.get(`/medicos/${id}`)
    return data
  },
  async crear(datos) {
    const { data } = await api.post('/medicos', datos)
    return data
  },
  async actualizar(id, datos) {
    const { data } = await api.put(`/medicos/${id}`, datos)
    return data
  },
  async eliminar(id) {
    const { data } = await api.delete(`/medicos/${id}`)
    return data
  }
}