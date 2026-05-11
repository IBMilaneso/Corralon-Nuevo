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
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/registrar',
      name: 'registrar',
      component: RegistroVehiculo
    },
    {
      path: '/inventario',
      name: 'inventario',
      component: Inventario 
    },
    {
      path: '/buscar',
      name: 'buscar',
      component: Buscador
    },
    {
      path: '/vehiculo/:id', 
      name: 'vehiculoDetalle',
      component: VehiculoDetalle
    },
    {
      path: '/sobre-nosotros',
      name: 'sobreNosotros',
      component: SobreNosotros
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/reportes',
      name: 'Reportes',
      component: Reportes
    }
  ]
})

export default router