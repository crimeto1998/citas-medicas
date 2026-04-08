<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>🏥 Citas Médicas</h1>
      <h2>Crear Cuenta</h2>
      <form @submit.prevent="handleRegistro">
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="form.nombre" type="text" placeholder="Tu nombre" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="correo@ejemplo.com" required />
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input v-model="form.password" type="password" placeholder="Mínimo 6 caracteres" required />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="cargando">
          {{ cargando ? 'Registrando...' : 'Registrarse' }}
        </button>
        <p class="link">¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link></p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ nombre: '', email: '', password: '' })
const error = ref('')
const cargando = ref(false)

async function handleRegistro() {
  try {
    cargando.value = true
    error.value = ''
    await authStore.registro(form.value)
    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al registrarse'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f4f8;
}
.auth-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}
h1 { text-align: center; color: #2563eb; margin-bottom: 0.5rem; }
h2 { text-align: center; color: #374151; margin-bottom: 1.5rem; }
.form-group { margin-bottom: 1rem; }
label { display: block; margin-bottom: 0.3rem; color: #374151; font-weight: 500; }
input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}
button {
  width: 100%;
  padding: 0.75rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 0.5rem;
}
button:disabled { background: #93c5fd; }
button:hover:not(:disabled) { background: #1d4ed8; }
.error { color: #ef4444; font-size: 0.9rem; }
.link { text-align: center; margin-top: 1rem; color: #6b7280; }
.link a { color: #2563eb; }
</style>