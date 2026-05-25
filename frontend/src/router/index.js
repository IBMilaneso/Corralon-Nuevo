import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../components/Dashboard.vue'
import RegistroVehiculo from '../components/RegistroVehiculo.vue'
import Inventario from '../components/Inventario.vue'
import Buscador from '../components/Buscador.vue'
import VehiculoDetalle from '../components/VehiculoDetalle.vue'
import SobreNosotros from '../components/SobreNosotros.vue'
import Login from '../components/Login.vue'
import Reportes from '../components/Reportes.vue'

// 1. IMPORTAMOS EL NUEVO COMPONENTE DE REGISTRO
import RegistroCiudadano from '../components/RegistroCiudadano.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/', 
      name: 'dashboard', 
      component: Dashboard, 
      //meta: { rolesPermitidos: ['Administrador', 'RolOperativo', 'RolCobranza'] } 
    },
    { 
      path: '/registrar', 
      name: 'registrar', 
      component: RegistroVehiculo, 
      meta: { rolesPermitidos: ['Administrador', 'RolOperativo'] } 
    },
    { 
      path: '/inventario', 
      name: 'inventario', 
      component: Inventario, 
      meta: { rolesPermitidos: ['Administrador', 'RolOperativo', 'RolCobranza'] } 
    },
    { path: '/buscar', name: 'buscar', component: Buscador },
    { path: '/vehiculo/:id', name: 'vehiculoDetalle', component: VehiculoDetalle },
    { path: '/sobre-nosotros', name: 'sobreNosotros', component: SobreNosotros },
    { path: '/login', name: 'login', component: Login },
    { 
      path: '/reportes', 
      name: 'reportes', 
      component: Reportes, 
      meta: { rolesPermitidos: ['Administrador'] } 
    },
    // 2. AGREGAMOS LA NUEVA RUTA DE REGISTRO PÚBLICA
    { 
      path: '/registro-ciudadano', 
      name: 'registroCiudadano', 
      component: RegistroCiudadano 
    }
  ]
});

router.beforeEach((to, from, next) => {
  // CORRECCIÓN CLAVE: Ahora buscamos 'rolUsuario' exactamente como lo guarda el Login
  const rolUsuario = localStorage.getItem('rolUsuario') || ''; 

  // Verificamos si la ruta a la que vamos necesita protección
  if (to.meta.rolesPermitidos) {
    
    // Verificamos si el rol está en la lista de permitidos
    if (rolUsuario && to.meta.rolesPermitidos.includes(rolUsuario)) {
      next(); // ¡Pásale, tienes permiso!
    } else {
      // Si está logueado como ciudadano y trata de entrar a algo prohibido, lo mandamos a Buscar
      if (rolUsuario === 'ciudadano') {
        next('/buscar'); 
      } else {
        // Si no está logueado o su rol no existe, al login
        next('/login'); 
      }
    }
  } else {
    // La ruta no está protegida (ej. Buscar, Sobre Nosotros, Login, Registro)
    // Evitamos que alguien logueado vuelva a entrar a login o registro
    if ((to.name === 'login' || to.name === 'registroCiudadano') && rolUsuario) {
      if (rolUsuario === 'ciudadano') {
        next('/buscar');
      } else {
        next('/');
      }
    } else {
      next(); 
    }
  }
});

export default router;