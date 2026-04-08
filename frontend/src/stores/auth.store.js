import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref(JSON.parse(localStorage.getItem('usuario')) || null)
  const token = ref(localStorage.getItem('token') || null)

  const estaAutenticado = computed(() => !!token.value)
  const esAdmin = computed(() => usuario.value?.rol === 'admin')

  async function login(datos) {
    const respuesta = await authService.login(datos)
    usuario.value = respuesta
    token.value = respuesta.token
    localStorage.setItem('token', respuesta.token)
    localStorage.setItem('usuario', JSON.stringify(respuesta))
  }

  async function registro(datos) {
    const respuesta = await authService.registro(datos)
    usuario.value = respuesta
    token.value = respuesta.token
    localStorage.setItem('token', respuesta.token)
    localStorage.setItem('usuario', JSON.stringify(respuesta))
  }

  function logout() {
    usuario.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  return { usuario, token, estaAutenticado, esAdmin, login, registro, logout }
})