<script setup>
import { ref, onMounted, computed } from 'vue'; // <-- 1. Importar computed
import { useRouter } from 'vue-router';
import axios from 'axios';

const inventario = ref([]); // Lista completa de la BD
const router = useRouter();
const terminoBusqueda = ref(''); // <-- 2. Nuevo ref para la búsqueda

// Pedir todos los vehículos (esto no cambia)
onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/vehiculos');
    inventario.value = response.data; // La BD ya los manda ordenados
  } catch (error) {
    console.error('Error al obtener el inventario:', error);
  }
});

// --- 3. NUEVA PROPIEDAD COMPUTADA PARA FILTRAR ---
const inventarioFiltrado = computed(() => {
  // Si la barra está vacía, muestra todo
  if (!terminoBusqueda.value) {
    return inventario.value;
  }

  const busqueda = terminoBusqueda.value.toLowerCase().trim();

  // Filtra la lista basándose en el término de búsqueda
  return inventario.value.filter(vehiculo => {
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
// --- Fin de la propiedad computada ---

// Función para formatear la fecha (no cambia)
function formatFecha(timestamp) {
  if (!timestamp) return 'No registrada';
  return new Date(timestamp).toLocaleDateString('es-MX');
}

// Función para ver detalle (no cambia)
function verDetalle(id){
  router.push({ name: 'vehiculoDetalle', params: { id }, query: { modo: 'editar' } });
}
</script>

<template>
  <div class="inventario-view">
    <div class="header-banner">
      <div class="banner-info">
        <h1>🚗 Inventario Actual del Corralón</h1>
        <p>Aquí puedes ver todos los vehículos actualmente bajo resguardo.</p>
      </div>
      
      <div class="search-bar-container">
        <input 
          type="text" 
          v-model="terminoBusqueda" 
          placeholder="Buscar por placa, marca, modelo..." 
          class="search-input"
        >
      </div>
    </div>

    <table class="inventario-table">
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
      <tr v-for="vehiculo in inventarioFiltrado" :key="vehiculo.id" @click="verDetalle(vehiculo.id)">
          <td>
            <img 
              v-if="vehiculo.fotos && vehiculo.fotos.length > 0" 
              :src="`http://localhost:3000/${vehiculo.fotos[0]}`" 
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

    <p v-if="inventarioFiltrado.length === 0" class="empty-message">
      <span v-if="terminoBusqueda">No se encontraron vehículos que coincidan con "{{ terminoBusqueda }}".</span>
      <span v-else>No hay vehículos registrados en el inventario.</span>
    </p>
  </div>
</template>

<style scoped>
.inventario-view {
  animation: fadeIn 0.5s ease-in-out;
}

/* --- Estilos para el nuevo banner --- */
.header-banner {
  background: linear-gradient(to right, #34495e, #2c3e50);
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-banner h1 {
  margin: 0;
  font-size: 1.8rem;
}

.header-banner p {
  margin: 0.5rem 0 0;
  opacity: 0.9;
}

/* --- Estilos para la tabla y la imagen --- */
.inventario-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden; /* Para que los bordes redondeados se apliquen a la tabla */
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
  vertical-align: middle; /* Centra el contenido verticalmente */
}

thead {
  background-color: #f8f9fa;
}

th {
  font-weight: 600;
}

tbody tr:hover {
  background-color: #f1f1f1;
  cursor: pointer;
}

.vehiculo-imagen {
  width: 100px;
  height: 60px;
  object-fit: cover; /* Asegura que la imagen no se deforme */
  border-radius: 6px;
}

.empty-message {
  text-align: center;
  margin-top: 2rem;
  font-size: 1.1rem;
  color: #777;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* --- Estilos para el buscador chiquito --- */
.search-bar-container {
  width: 100%;
  max-width: 400px; /* Esto lo hace "chiquito" y no ocupa todo el ancho */
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.3); /* Borde claro */
  background-color: rgba(255, 255, 255, 0.1); /* Fondo oscuro transparente */
  color: white; /* Texto blanco */
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

</style>