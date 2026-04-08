import api from './api'

export const authService = {
  async registro(datos) {
    const { data } = await api.post('/auth/registro', datos)
    return data
  },
  async login(datos) {
    const { data } = await api.post('/auth/login', datos)
    return data
  },
  async perfil() {
    const { data } = await api.get('/auth/perfil')
    return data
  }
}