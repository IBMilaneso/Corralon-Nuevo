<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const API_BASE_URL = 'http://localhost:3000';

// Variables del formulario
const formulario = ref({
  nombre: '',
  apellidos: '',
  rfc: '',
  licencia: '',
  correo: '',
  password: ''
});

const mensajeError = ref('');
const mensajeExito = ref('');
const cargando = ref(false);

async function registrarCiudadano() {
  mensajeError.value = '';
  mensajeExito.value = '';
  cargando.value = true;

  try {
    const response = await axios.post(`${API_BASE_URL}/api/registro/ciudadanos`, formulario.value);
    
    if (response.data.success) {
      mensajeExito.value = '¡Registro exitoso! Redirigiendo al inicio de sesión...';
      
      // Esperamos 2 segundos para que el usuario lea el mensaje antes de enviarlo al login
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  } catch (error) {
    if (error.response && error.response.data.message) {
      mensajeError.value = error.response.data.message; // Muestra "El correo o RFC ya están registrados"
    } else {
      mensajeError.value = 'Ocurrió un error al intentar registrarte. Intenta más tarde.';
    }
  } finally {
    cargando.value = false;
  }
}
</script>

<template>
  <div class="registro-container">
    <div class="registro-card">
      
      <div class="header">
        <h1>📝 Registro Ciudadano</h1>
        <p>Ingresa tus datos oficiales para poder reclamar tu vehículo.</p>
      </div>

      <form @submit.prevent="registrarCiudadano" class="formulario">
        
        <div class="grid-2-columnas">
          <div class="campo">
            <label>Nombre(s):</label>
            <input type="text" v-model="formulario.nombre" placeholder="Ej. Juan" required>
          </div>
          <div class="campo">
            <label>Apellidos:</label>
            <input type="text" v-model="formulario.apellidos" placeholder="Ej. Pérez García" required>
          </div>
        </div>

        <div class="grid-2-columnas">
          <div class="campo">
            <label>RFC (Con homoclave):</label>
            <input type="text" v-model="formulario.rfc" placeholder="13 caracteres" maxlength="13" required>
          </div>
          <div class="campo">
            <label>Número de Licencia:</label>
            <input type="text" v-model="formulario.licencia" placeholder="Folio de licencia" required>
          </div>
        </div>

        <div class="campo">
          <label>Correo Electrónico:</label>
          <input type="email" v-model="formulario.correo" placeholder="ejemplo@correo.com" required>
        </div>

        <div class="campo">
          <label>Contraseña:</label>
          <input type="password" v-model="formulario.password" placeholder="Crea una contraseña segura" required minlength="6">
        </div>

        <p v-if="mensajeError" class="alerta error">{{ mensajeError }}</p>
        <p v-if="mensajeExito" class="alerta exito">{{ mensajeExito }}</p>

        <button type="submit" class="btn-submit" :disabled="cargando">
          {{ cargando ? 'Registrando...' : 'Crear Mi Cuenta' }}
        </button>

      </form>

      <div class="footer-links">
        <p>¿Ya tienes una cuenta?</p>
        <button class="btn-volver" @click="router.push('/login')">Regresar al Login</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

* { font-family: 'Montserrat', sans-serif; }

.registro-container {
  display: flex; justify-content: center; align-items: center; 
  min-height: 85vh; padding: 2rem 1rem;
}

.registro-card {
  background: white; width: 100%; max-width: 550px; 
  padding: 2.5rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.header { text-align: center; margin-bottom: 2rem; }
.header h1 { color: #1e293b; margin: 0 0 0.5rem 0; font-size: 1.8rem; }
.header p { color: #64748b; margin: 0; font-size: 0.95rem; }

.grid-2-columnas { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.campo { margin-bottom: 1.2rem; }
label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: #334155; font-size: 0.9rem; }
input { 
  width: 100%; padding: 0.8rem; border: 1px solid #cbd5e1; 
  border-radius: 6px; box-sizing: border-box; font-size: 1rem; transition: border-color 0.2s;
}
input:focus { outline: none; border-color: #10b981; }

.alerta { padding: 0.8rem; border-radius: 6px; font-weight: 500; font-size: 0.9rem; text-align: center; margin-bottom: 1rem; }
.error { background-color: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }
.exito { background-color: #f0fdf4; color: #10b981; border: 1px solid #d1fae5; }

.btn-submit {
  width: 100%; padding: 1rem; background-color: #10b981; color: white; 
  border: none; border-radius: 6px; font-size: 1.05rem; font-weight: 600; 
  cursor: pointer; transition: background-color 0.3s;
}
.btn-submit:hover:not(:disabled) { background-color: #059669; }
.btn-submit:disabled { background-color: #9ca3af; cursor: not-allowed; }

.footer-links { margin-top: 2rem; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 1.5rem; }
.footer-links p { color: #64748b; margin: 0 0 0.5rem 0; font-size: 0.9rem; }
.btn-volver {
  background: none; border: none; color: #3b82f6; font-weight: 600; 
  cursor: pointer; font-size: 0.95rem; padding: 0;
}
.btn-volver:hover { text-decoration: underline; }

@media (max-width: 600px) {
  .grid-2-columnas { grid-template-columns: 1fr; gap: 0; }
}
</style>