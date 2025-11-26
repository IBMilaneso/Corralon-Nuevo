<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const esAdmin = ref(false);

// Al cargar el sidebar, revisamos si existe la "cookie" (localStorage)
onMounted(() => {
  esAdmin.value = localStorage.getItem('esAdmin') === 'true';
});

function cerrarSesion() {
  localStorage.removeItem('esAdmin'); // Borramos la "cookie"
  window.location.href = '/'; // Recargamos para limpiar todo
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

      <template v-if="esAdmin">
        <div class="divider">Administración</div>
        
        <router-link to="/registrar" class="nav-link">
          <span class="icon">➕</span> Registrar Vehículo
        </router-link>
        
        <router-link to="/inventario" class="nav-link">
          <span class="icon">🚗</span> Inventario Actual
        </router-link>
      </template>
    </nav>

    <div class="bottom-links">
      <router-link to="/sobre-nosotros" class="nav-link about-link">
        <span class="icon">ℹ️</span> Sobre Nosotros
      </router-link>

      <router-link v-if="!esAdmin" to="/login" class="nav-link login-btn">
        <span class="icon">🔐</span> Iniciar Sesión
      </router-link>

      <button v-if="esAdmin" @click="cerrarSesion" class="nav-link logout-btn">
        <span class="icon">🚪</span> Cerrar Sesión
      </button>
    </div>
    
  </aside>
</template>

<style scoped>
.sidebar {
  width: 250px;
  
  /* --- AQUÍ ESTÁ EL CAMBIO --- */
  /* Degradado de arriba (to bottom). Cambia los colores a tu gusto */
  background: linear-gradient(to bottom, #2c3e50, #0a0e12);
  
  color: white;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100vh; /* Ocupa toda la altura */
  box-sizing: border-box;
  
  /* Opcional: Una sombra sutil a la derecha para separarlo del contenido */
  box-shadow: 2px 0 10px rgba(0,0,0,0.3);
}
.sidebar h3 { text-align: center; margin-bottom: 2rem; font-size: 1.5rem; }
.navigation-menu { display: flex; flex-direction: column; gap: 0.5rem; }
.nav-link {
  display: flex; align-items: center; padding: 0.8rem 1rem;
  color: #bdc3c7; text-decoration: none; border-radius: 6px;
  transition: background-color 0.3s, color 0.3s; cursor: pointer; border: none; background: none; width: 100%; font-size: 1rem;
}
.nav-link .icon { margin-right: 0.8rem; font-size: 1.2rem; }
.nav-link:hover { background-color: #34495e; color: #ffffff; }
.router-link-exact-active { background-color: #42b983; color: #ffffff; font-weight: bold; }

.divider {
  margin-top: 1rem; margin-bottom: 0.5rem; padding-left: 1rem;
  font-size: 0.8rem; text-transform: uppercase; color: #7f8c8d; letter-spacing: 1px; border-bottom: 1px solid #3e5871; padding-bottom: 5px;
}

.bottom-links { margin-top: auto; display: flex; flex-direction: column; gap: 5px; }
.login-btn { background-color: #2980b9; color: white; margin-top: 10px; }
.login-btn:hover { background-color: #3498db; }
.logout-btn { background-color: #c0392b; color: white; margin-top: 10px; justify-content: flex-start;}
.logout-btn:hover { background-color: #e74c3c; }
</style>