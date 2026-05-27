<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';
const router = useRouter();

// Variable mágica para alternar las vistas
const tipoAcceso = ref('ciudadano'); // Puede ser 'ciudadano' o 'empleado'

// Variables del formulario
const identificador = ref(''); // Servirá para Usuario, Correo o RFC
const password = ref('');
const errorMsg = ref('');

async function iniciarSesion() {
  errorMsg.value = ''; // Limpiamos errores previos
  
  try {
    // Definimos a qué ruta del backend vamos a golpear según la pestaña
    const endpoint = tipoAcceso.value === 'empleado' 
      ? '/api/login/empleados' 
      : '/api/login/ciudadanos';

    const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
      // Si es empleado mandamos 'username', si es ciudadano mandamos 'correo'
      [tipoAcceso.value === 'empleado' ? 'username' : 'correo']: identificador.value,
      password: password.value
    });

    if (response.data.success) {
      // Guardamos en el navegador quién entró
      localStorage.setItem('rolUsuario', response.data.rol);
      localStorage.setItem('usuario', tipoAcceso.value === 'empleado' ? identificador.value : response.data.nombre);

      localStorage.setItem('correoUsuario' , identificador.value);
      
      // Mandamos al usuario a la pantalla principal
      window.location.href = '/'; 
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      errorMsg.value = 'Credenciales incorrectas. Verifica tus datos.';
    } else {
      errorMsg.value = 'Error de conexión con el servidor.';
    }
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      
      <div class="login-header">
        <h1>{{ tipoAcceso === 'empleado' ? '🔐 Acceso Interno' : '🚗 Portal Ciudadano' }}</h1>
        <p>
          {{ tipoAcceso === 'empleado' 
            ? 'Panel exclusivo para personal operativo.' 
            : 'Consulta y gestiona la liberación de tu vehículo.' 
          }}
        </p>
      </div>

      <div class="tabs-container">
        <button 
          :class="['tab-btn', { active: tipoAcceso === 'ciudadano' }]" 
          @click="tipoAcceso = 'ciudadano'; errorMsg = ''; identificador = ''; password = '';"
          type="button"
        >
          🙋‍♂️ Ciudadano
        </button>
        <button 
          :class="['tab-btn', { active: tipoAcceso === 'empleado' }]" 
          @click="tipoAcceso = 'empleado'; errorMsg = ''; identificador = ''; password = '';"
          type="button"
        >
          👮 Empleado
        </button>
      </div>

      <form @submit.prevent="iniciarSesion" class="form-body">
        
        <div class="campo">
          <label>{{ tipoAcceso === 'empleado' ? 'Usuario Administrativo:' : 'Correo Electrónico:' }}</label>
          <input 
            :type="tipoAcceso === 'empleado' ? 'text' : 'email'" 
            v-model="identificador" 
            :placeholder="tipoAcceso === 'empleado' ? 'Ej. Roman' : 'ejemplo@correo.com'" 
            required
          >
        </div>
        
        <div class="campo">
          <label>Contraseña:</label>
          <input type="password" v-model="password" placeholder="***" required>
        </div>
        
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
        
        <button type="submit" class="btn-submit">
          {{ tipoAcceso === 'empleado' ? 'Ingresar al Sistema' : 'Entrar a mi cuenta' }}
        </button>
      </form>

      <div class="registro-section" v-if="tipoAcceso === 'ciudadano'">
        <p>¿Tu vehículo está en el corralón y no tienes cuenta?</p>
        <router-link to="/registro-ciudadano" class="btn-registro">
          Crear cuenta nueva
        </router-link>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

* { font-family: 'Montserrat', sans-serif; }

.login-container { 
  display: flex; justify-content: center; align-items: center; 
  min-height: 80vh; padding: 2rem;
}

.login-card { 
  background-color: white; padding: 2.5rem; border-radius: 12px; 
  box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 100%; max-width: 420px; 
}

.login-header { text-align: center; margin-bottom: 2rem; }
.login-header h1 { color: #1e293b; margin: 0 0 0.5rem 0; font-size: 1.6rem; }
.login-header p { color: #64748b; margin: 0; font-size: 0.95rem; }

/* ESTILOS DEL SWITCHER */
.tabs-container {
  display: flex; background: #f1f5f9; border-radius: 8px; 
  padding: 4px; margin-bottom: 2rem;
}

.tab-btn {
  flex: 1; padding: 0.8rem; border: none; background: transparent; 
  border-radius: 6px; font-weight: 600; color: #64748b; 
  cursor: pointer; transition: all 0.3s;
}

.tab-btn.active {
  background: white; color: #0f172a; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* FORMULARIO */
.campo { margin-bottom: 1.2rem; }
label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: #334155; font-size: 0.9rem; }
input { 
  width: 100%; padding: 0.8rem; border: 1px solid #cbd5e1; 
  border-radius: 6px; box-sizing: border-box; font-size: 1rem; transition: border-color 0.2s;
}
input:focus { outline: none; border-color: #3b82f6; }

.btn-submit { 
  width: 100%; padding: 0.9rem; background-color: #3b82f6; color: white; 
  border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; 
  cursor: pointer; transition: background-color 0.3s; margin-top: 0.5rem; 
}
.btn-submit:hover { background-color: #2563eb; }

.error { color: #ef4444; font-weight: 500; margin: 0.5rem 0 1rem 0; font-size: 0.9rem; text-align: center; }

/* SECCIÓN REGISTRO */
.registro-section {
  margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; text-align: center;
}
.registro-section p { margin: 0 0 1rem 0; color: #64748b; font-size: 0.9rem; }
.btn-registro {
  display: inline-block; width: 100%; padding: 0.8rem; 
  background-color: white; color: #10b981; border: 1px solid #10b981; 
  border-radius: 6px; text-decoration: none; font-weight: 600; 
  transition: all 0.3s; box-sizing: border-box;
}
.btn-registro:hover { background-color: #f0fdf4; }
</style>