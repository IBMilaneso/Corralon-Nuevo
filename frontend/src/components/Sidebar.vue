<script setup>
import { ref, watchEffect } from 'vue'; // ¡Agregamos watchEffect!
import { useRouter } from 'vue-router';

const router = useRouter();
const esAdmin = ref(false);
const rolActual = ref(''); 

// watchEffect es como un radar que detecta cambios continuamente
watchEffect(() => {
  rolActual.value = localStorage.getItem('userRol') || '';
  esAdmin.value = rolActual.value === 'Administrador';
});

function cerrarSesion() {
  localStorage.removeItem('esAdmin');
  localStorage.removeItem('userRol');
  rolActual.value = ''; // Limpiamos la variable
  router.push('/login'); // Usamos el router de Vue para redirigir
}
</script>

<template>
  <aside class="sidebar">
    <h3>Corralink</h3>
    
    <nav class="navigation-menu">
      <router-link to="/" class="nav-link">
        <span class="icon">📊</span> Dashboard
      </router-link>
      
      <router-link to="/buscar" class="nav-link">
        <span class="icon">👁️‍🗨️</span> Buscar
      </router-link>

      <template v-if="rolActual">
        <div class="divider">Administración</div>
        
        <router-link v-if="rolActual === 'Administrador' || rolActual === 'RolOperativo'" to="/registrar" class="nav-link">
          <span class="icon">➕</span> Registrar Vehículo
        </router-link>
        
        <router-link to="/inventario" class="nav-link">
          <span class="icon">🚗</span> Inventario Actual
        </router-link>

        <router-link v-if="esAdmin" to="/reportes" class="nav-link">
          <span class="icon">📈</span> Reportes
        </router-link>
      </template>
    </nav>

    <div class="bottom-links">
      <router-link to="/sobre-nosotros" class="nav-link about-link">
        <span class="icon">ℹ️</span> Sobre Nosotros
      </router-link>

      <router-link v-if="!rolActual" to="/login" class="nav-link login-btn">
        <span class="icon">🔐</span> Iniciar Sesión
      </router-link>

      <button v-if="rolActual" @click="cerrarSesion" class="nav-link logout-btn">
        <span class="icon">🚪</span> Cerrar Sesión
      </button>
    </div>
  </aside>
</template>

<style scoped>
/* Todo tu CSS original se mantiene exactamente igual */
.sidebar { width: 250px; background: linear-gradient(to bottom, #2c3e50, #0a0e12); color: white; padding: 1.5rem; display: flex; flex-direction: column; height: 100vh; box-sizing: border-box; box-shadow: 2px 0 10px rgba(0,0,0,0.3); }
.sidebar h3 { text-align: center; margin-bottom: 2rem; font-size: 1.5rem; background-image: linear-gradient(to right, #42b983, #3498db); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.1)); }
.navigation-menu { display: flex; flex-direction: column; gap: 0.5rem; }
.nav-link { display: flex; align-items: center; padding: 0.8rem 1rem; color: #bdc3c7; text-decoration: none; border-radius: 6px; transition: background-color 0.3s, color 0.3s; cursor: pointer; border: none; background: none; width: 100%; font-size: 1rem; }
.nav-link .icon { margin-right: 0.8rem; font-size: 1.2rem; }
.nav-link:hover { background-color: #34495e; color: #ffffff; }
.router-link-exact-active { background-color: #42b983; color: #ffffff; font-weight: bold; }
.divider { margin-top: 1rem; margin-bottom: 0.5rem; padding-left: 1rem; font-size: 0.8rem; text-transform: uppercase; color: #7f8c8d; letter-spacing: 1px; border-bottom: 1px solid #3e5871; padding-bottom: 5px; }
.bottom-links { margin-top: auto; display: flex; flex-direction: column; gap: 5px; }
.login-btn { background-color: #2980b9; color: white; margin-top: 10px; }
.login-btn:hover { background-color: #3498db; }
.logout-btn { background: linear-gradient(to right, #f41313ff, #f46a3dff); color: white; margin-top: 10px; justify-content: flex-start;}
.logout-btn:hover { background-color: #e74c3c; }
</style>