<script setup>
import { ref, onMounted, computed } from 'vue'; 
import { useRouter } from 'vue-router';
import axios from 'axios';

// 1. IMPORTAMOS LOS 3 MODALES
import ModalDetalleVehiculo from '../components/ModalDetalleVehiculo.vue';
import ModalReclamo from '../components/ModalReclamo.vue';
import ModalCompra from '../components/ModalCompra.vue';

const API_BASE_URL = 'http://localhost:3000';

const todosLosVehiculos = ref([]); 
const terminoBusqueda = ref(''); 
const router = useRouter();

// 2. VARIABLES PARA LOS MODALES
const vehiculoSeleccionado = ref(null);
const mostrarModalDetalle = ref(false);
const esInvitado = ref(true); // <--- SIEMPRE SERÁ TRUE EN ESTA VISTA

const mostrarModalReclamo = ref(false);
const vehiculoParaReclamo = ref(null);

const mostrarModalCompra = ref(false);

onMounted(async () => {
  // BORRAMOS LA VALIDACIÓN DEL ROL PARA QUE NUNCA OCULTE LOS BOTONES EN EL BUSCADOR

  try {
    const response = await axios.get(`${API_BASE_URL}/api/vehiculos`);
    todosLosVehiculos.value = response.data;
  } catch (error) {
    console.error('Error al obtener el inventario:', error);
  }
});

const resultadosFiltrados = computed(() => {
  if (terminoBusqueda.value.trim() === '') {
    return [];
  }

  const busqueda = terminoBusqueda.value.toLowerCase().trim();

  return todosLosVehiculos.value.filter(vehiculo => {
    const placa = (vehiculo.placa || '').toLowerCase();
    const marca = (vehiculo.marca || '').toLowerCase();
    const modelo = (vehiculo.modelo || '').toLowerCase();
    const color = (vehiculo.color || '').toLowerCase();
    const anio = (vehiculo.anio || '').toString();

    return (
      placa.includes(busqueda) ||
      marca.includes(busqueda) ||
      modelo.includes(busqueda) ||
      color.includes(busqueda) ||
      anio.includes(busqueda)
    );
  });
});

function formatFecha(timestamp) {
  if (!timestamp) return 'No registrada';
  return new Date(timestamp).toLocaleDateString('es-MX');
}

function abrirModal(vehiculo) {
  vehiculoSeleccionado.value = vehiculo;
  mostrarModalDetalle.value = true;
}

function getImageUrl(rutaOriginal) {
  if (!rutaOriginal) return '';
  const rutaCorregida = rutaOriginal.replace(/\\/g, '/');
  return `${API_BASE_URL}/${rutaCorregida}`;
}

// 4. FUNCIONES PREPARADAS PARA LOS BOTONES DEL MODAL
function iniciarReclamo(vehiculo) {
  mostrarModalDetalle.value = false; 
  vehiculoParaReclamo.value = vehiculo; 
  mostrarModalReclamo.value = true; 
}

function manejarCompra() {
  mostrarModalDetalle.value = false; 
  mostrarModalCompra.value = true;   
}
</script>

<template>
  <div class="buscador-view">
    
    <div class="buscador-container">
      <h1>Busca un Vehículo en el Inventario</h1>
      <p>Busca por placa, marca, modelo, color o año.</p>
      <div class="search-form">
        <input 
          type="text" 
          placeholder="Escribe la placa, marca, modelo..."
          v-model="terminoBusqueda"
          class="search-input"
          autofocus
        >
      </div>
    </div>

    <table v-if="resultadosFiltrados.length > 0" class="inventario-table">
      <thead>
        <tr>
          <th>Imagen</th>
          <th>Placa</th>
          <th>Marca</th>
          <th>Modelo</th>
          <th>Año</th>
          <th>Fecha de Ingreso</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="vehiculo in resultadosFiltrados" :key="vehiculo.id" @click="abrirModal(vehiculo)">
          <td>
            <img 
              v-if="vehiculo.fotos && vehiculo.fotos.length > 0" 
              :src="getImageUrl(vehiculo.fotos[0])" 
              alt="Foto del vehículo" 
              class="vehiculo-imagen"
            >
          </td>
          <td>{{ vehiculo.placa }}</td>
          <td>{{ vehiculo.marca }}</td>
          <td>{{ vehiculo.modelo }}</td>
          <td>{{ vehiculo.anio }}</td>
          <td>{{ formatFecha(vehiculo.fecha_ingreso) }}</td>
        </tr>
      </tbody>
    </table>
    
    <div v-else class="empty-message">
      <p v-if="!terminoBusqueda">Escribe en la barra para comenzar la búsqueda.</p>
      <p v-else>No se encontraron vehículos que coincidan con "{{ terminoBusqueda }}".</p>
    </div>

    <ModalDetalleVehiculo 
      :mostrar="mostrarModalDetalle" 
      :vehiculo="vehiculoSeleccionado" 
      :esInvitado="esInvitado"
      @cerrar="mostrarModalDetalle = false"
      @abrirReclamo="iniciarReclamo" 
      @abrirCompra="manejarCompra"
    />

    <ModalReclamo 
      :mostrar="mostrarModalReclamo" 
      :vehiculo="vehiculoParaReclamo" 
      @cerrar="mostrarModalReclamo = false"
    />

    <ModalCompra 
      :mostrar="mostrarModalCompra" 
      :vehiculo="vehiculoSeleccionado" 
      @cerrar="mostrarModalCompra = false"
    />

  </div>
</template>

<style scoped>
/* TODO TU CSS SE QUEDA EXACTAMENTE IGUAL */
.buscador-view {
  animation: fadeIn 0.5s ease-in-out;
}

.buscador-container {
  max-width: 900px;
  margin: 0 auto 2rem auto;
  text-align: center;
  padding: 2rem;
  background-color: #fff;
  color: #333;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.buscador-container h1 { margin-top: 0; color: #2c3e50; }
.search-form { margin-top: 1.5rem; }

.search-input {
  width: 100%; padding: 1rem; font-size: 1.2rem; border: 2px solid #eee;
  border-radius: 8px; box-sizing: border-box; transition: border-color 0.3s;
}
.search-input:focus { outline: none; border-color: #3498db; }

.inventario-table {
  width: 100%; border-collapse: collapse; background: linear-gradient(to right, #2c3e50, #0a0e12);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); border-radius: 8px; overflow: hidden; margin-top: 2rem;
}

th, td {
  padding: 1rem; text-align: left; border-bottom: 1px solid #444;
  vertical-align: middle; font-size: 1.2rem; font-weight: 600; color: #ffff;
}
thead { background: linear-gradient(to right, #2c3e50, #01655c, #2c3e50); }
th { font-weight: 600; }
tbody tr { transition: all 0.3s ease-in-out; }
tbody tr:hover { background: linear-gradient(to right, #2c3e50, #01655c, #2c3e50); cursor: pointer; }

.vehiculo-imagen {
  width: 160px; height: 100px; object-fit: cover; border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); display: block;
}

.empty-message { text-align: center; margin-top: 3rem; font-size: 1.2rem; color: #7f8c8d; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>