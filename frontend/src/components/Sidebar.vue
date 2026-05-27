<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
// Ahora guardamos el rol exacto: 'admin', 'cobranza', o 'operativo'
const rolUsuario = ref(''); 
const estaLogueado = ref(false);

onMounted(() => {
  // Asumimos que en el Login guardas el rol, por ejemplo: localStorage.setItem('rolUsuario', 'cobranza')
  rolUsuario.value = localStorage.getItem('rolUsuario') || '';
  
  // Si hay un rol guardado, significa que alguien inició sesión
  estaLogueado.value = rolUsuario.value !== ''; 
});

function cerrarSesion() {
  localStorage.removeItem('rolUsuario');
  localStorage.removeItem('usuario');
  window.location.href = '/';
}
</script>

<template>
  <aside class="sidebar">
    <div class="brand-section">
      <img src="https://i.postimg.cc/1z5Y5xdM/Logo-Corralink-STEP.png" alt="Logo STEP" class="brand-logo" />
      <h1 class="brand-name">S T E P</h1>
    </div>
    
    <nav class="navigation-menu">
      <router-link to="/" class="nav-link">
        <span class="icon">📊</span> Dashboard
      </router-link>
      
      <router-link to="/buscar" class="nav-link">
        <span class="icon">👁️‍🗨️</span> Buscar
      </router-link>

      <template v-if="estaLogueado">
        <div class="divider">Módulos Operativos</div>
        
        <router-link 
          v-if="rolUsuario === 'Administrador' || rolUsuario === 'RolOperativo'" 
          to="/registrar" class="nav-link">
          <span class="icon">➕</span> Registrar Vehículo
        </router-link>
        
        <router-link to="/inventario" class="nav-link">
          <span class="icon">🚗</span> Inventario Actual
        </router-link>

        <router-link 
          v-if="rolUsuario === 'Administrador' || rolUsuario === 'RolCobranza'" 
          to="/bandeja" class="nav-link">
          <span class="icon">📥</span> Bandeja Reclamos
        </router-link>

        <router-link 
          v-if="rolUsuario === 'Administrador'" 
          to="/reportes" class="nav-link">
          <span class="icon">📈</span> Productividad
        </router-link>
      </template>
    </nav>

    <div class="bottom-links">
      <router-link to="/sobre-nosotros" class="nav-link about-link">
        <span class="icon">ℹ️</span> Sobre Nosotros
      </router-link>

      <router-link v-if="!estaLogueado" to="/login" class="nav-link login-btn">
        <span class="icon">🔐</span> Iniciar Sesión
      </router-link>

      <button v-if="estaLogueado" @click="cerrarSesion" class="nav-link logout-btn">
        <span class="icon">🚪</span> Cerrar Sesión
      </button>
    </div>
  </aside>
</template>

<style scoped>
/* IMPORTAMOS LA FUENTE MONTSERRAT PARA TODO EL MENÚ */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&display=swap');

.sidebar {
  width: 280px;
  background: linear-gradient(to bottom, #1a252f, #05070a);
  color: white;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
  box-shadow: 4px 0 15px rgba(0,0,0,0.5);
  /* APLICAMOS LA FUENTE AQUÍ PARA QUE TODO EL TEXTO LA HEREDE */
  font-family: 'Montserrat', sans-serif;
}

.brand-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 3rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.brand-logo {
  width: 55px;
  height: auto;
  
  /* EL TRUCO VISUAL: */
  /* 1. brightness(0) vuelve la imagen totalmente negra */
  /* 2. invert(1) invierte ese negro a blanco puro */
  /* 3. drop-shadow (opcional) le da un ligero resplandor para que resalte aún más */
  filter: brightness(0) invert(1) drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.3));
  
  transition: transform 0.3s ease;
}

.brand-name {
  font-weight: 400;
  font-size: 1.4rem;
  color: #ffffff;
  letter-spacing: 6px;
  margin: 0;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

.navigation-menu { display: flex; flex-direction: column; gap: 0.5rem; }

.nav-link {
  display: flex; align-items: center; padding: 0.8rem 1rem;
  color: #bdc3c7; text-decoration: none; border-radius: 8px;
  transition: all 0.3s ease; cursor: pointer; border: none; background: none; width: 100%; 
  font-size: 0.95rem; font-weight: 400;
}

.nav-link .icon { margin-right: 12px; font-size: 1.1rem; opacity: 0.8; }

.nav-link:hover { 
  background-color: rgba(52, 73, 94, 0.4); 
  color: #ffffff; 
  transform: translateX(5px);
}

.router-link-exact-active { 
  background: rgba(66, 185, 131, 0.15);
  color: #42b983; 
  border-left: 3px solid #42b983;
  font-weight: 500;
}

.divider {
  margin-top: 1.5rem; margin-bottom: 0.5rem; padding-left: 0.5rem;
  font-size: 0.7rem; text-transform: uppercase; color: #5d6d7e; 
  letter-spacing: 2px; font-weight: 600;
}

.bottom-links { margin-top: auto; display: flex; flex-direction: column; gap: 8px; }

.logout-btn { 
  background: rgba(231, 76, 60, 0.1); 
  color: #e74c3c; 
  margin-top: 10px; 
  border: 1px solid rgba(231, 76, 60, 0.2);
  font-weight: 500;
}

.logout-btn:hover { 
  background: #e74c3c; 
  color: white; 
}
</style>