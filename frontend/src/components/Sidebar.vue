<template>
  <aside class="sidebar">
    <h3>Corralink</h3>
    <nav class="navigation-menu">
      <router-link to="/" class="nav-link">
        <span class="icon">📊</span> Dashboard
      </router-link>
      <router-link to="/registrar" class="nav-link">
        <span class="icon">➕</span> Registrar Vehículo
      </router-link>
      <router-link to="/inventario" class="nav-link">
        <span class="icon">🚗</span> Inventario Actual
      </router-link>
      <router-link to="/buscar" class="nav-link">
      <span class="icon">👁️‍🗨️</span> Buscar
      </router-link>
      <router-link to="/" class="nav-link">
        <span class="icon">🥱</span> P@l4br4S3cr3t4&Fuerte
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}
.sidebar h3 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}
.navigation-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.nav-link {
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  color: #bdc3c7;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.3s, color 0.3s;
}
.nav-link .icon {
  margin-right: 0.8rem;
  font-size: 1.2rem;
}
.nav-link:hover {
  background-color: #34495e;
  color: #ffffff;
}
/* Estilo para el enlace activo */
.router-link-exact-active {
  background-color: #42b983;
  color: #ffffff;
  font-weight: bold;
}
</style>