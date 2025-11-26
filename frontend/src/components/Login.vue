<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const username = ref('');
const password = ref('');
const errorMsg = ref('');

async function iniciarSesion() {
  try {
    const response = await axios.post('http://localhost:3000/api/login', {
      username: username.value,
      password: password.value
    });

    if (response.data.success) {
      // GUARDAMOS LA "SESIÓN" EN EL NAVEGADOR
      localStorage.setItem('esAdmin', 'true');
      
      // Forzamos una recarga para que el Sidebar se actualice
      window.location.href = '/'; 
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      errorMsg.value = 'Usuario o contraseña incorrectos.';
    } else {
      errorMsg.value = 'Error de conexión con el servidor.';
    }
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1>🔐 Acceso Administrativo</h1>
      <p>Ingresa tus credenciales para gestionar el corralón.</p>
      
      <form @submit.prevent="iniciarSesion">
        <div class="campo">
          <label>Usuario:</label>
          <input type="text" v-model="username" placeholder="admin" required>
        </div>
        <div class="campo">
          <label>Contraseña:</label>
          <input type="password" v-model="password" placeholder="123" required>
        </div>
        
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
        
        <button type="submit">Entrar al Sistema</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh; /* Centrado vertical */
}
.login-card {
  background-color: white;
  padding: 2.5rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  width: 100%;
  max-width: 400px;
  text-align: center;
}
h1 { color: #2c3e50; margin-bottom: 0.5rem; }
p { color: #7f8c8d; margin-bottom: 1.5rem; }
.campo { margin-bottom: 1rem; text-align: left; }
label { display: block; font-weight: bold; margin-bottom: 0.5rem; color: #333; }
input {
  width: 100%; padding: 0.8rem; border: 1px solid #ccc;
  border-radius: 6px; box-sizing: border-box; font-size: 1rem;
}
button {
  width: 100%; padding: 0.8rem; background-color: #3498db;
  color: white; border: none; border-radius: 6px;
  font-size: 1.1rem; font-weight: bold; cursor: pointer;
  transition: background-color 0.3s; margin-top: 1rem;
}
button:hover { background-color: #2980b9; }
.error { color: #e74c3c; font-weight: bold; margin-top: 1rem; }
</style>