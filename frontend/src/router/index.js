import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../components/Dashboard.vue'
import RegistroVehiculo from '../components/RegistroVehiculo.vue'
import Inventario from '../components/Inventario.vue'
import Buscador from '../components/Buscador.vue'
import VehiculoDetalle from '../components/VehiculoDetalle.vue';
import SobreNosotros from '../components/SobreNosotros.vue';
import Login from '../components/Login.vue';
import Reportes from '../components/Reportes.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
routes: [
    { path: '/', name: 'dashboard', component: Dashboard, meta: { rolesPermitidos: ['Administrador', 'RolOperativo', 'RolCobranza'] } },
    { path: '/registrar', name: 'registrar', component: RegistroVehiculo, meta: { rolesPermitidos: ['Administrador', 'RolOperativo'] } },
    { path: '/inventario', name: 'inventario', component: Inventario, meta: { rolesPermitidos: ['Administrador', 'RolOperativo', 'RolCobranza'] } },
    { path: '/buscar', name: 'buscar', component: Buscador },
    { path: '/vehiculo/:id', name: 'vehiculoDetalle', component: VehiculoDetalle },
    { path: '/sobre-nosotros', name: 'sobreNosotros', component: SobreNosotros },
    { path: '/login', name: 'login', component: Login },
    { path: '/reportes', name: 'reportes', component: Reportes, meta: { rolesPermitidos: ['Administrador'] } }
  ]
});

router.beforeEach((to, from, next) => {
  // Leemos el rol. Si no hay, le asignamos un string vacío para evitar errores.
  const userRol = localStorage.getItem('userRol') || ''; 

  // Revisamos si la ruta a la que vamos necesita protección
  if (to.meta.rolesPermitidos) {
    // Verificamos si el rol del usuario está en la lista de roles permitidos para esa ruta
    if (userRol && to.meta.rolesPermitidos.includes(userRol)) {
      next(); // ¡Pásale, tienes permiso!
    } else {
      next('/login'); // No tienes permiso o no has iniciado sesión, te mando al login.
    }
  } else {
    // La ruta no está protegida (ej. Buscar, Sobre Nosotros, Login)
    next(); 
  }
});

export default router