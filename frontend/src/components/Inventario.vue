<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const inventario = ref([]);
const router = useRouter();
const terminoBusqueda = ref('');
const mensajeSistema = ref(''); // Para mostrar mensajes de éxito/error

// Cargar datos
async function cargarInventario() {
  try {
    const response = await axios.get('http://localhost:3000/api/vehiculos');
    inventario.value = response.data;
  } catch (error) {
    console.error('Error al obtener el inventario:', error);
  }
}

onMounted(() => {
  cargarInventario();
});

// --- LÓGICA DE FILTRADO ---
const inventarioFiltrado = computed(() => {
  if (!terminoBusqueda.value) return inventario.value;
  
  const busqueda = terminoBusqueda.value.toLowerCase().trim();
  return inventario.value.filter(vehiculo => {
    const placa = (vehiculo.placa || '').toLowerCase();
    const marca = (vehiculo.marca || '').toLowerCase();
    const modelo = (vehiculo.modelo || '').toLowerCase();
    const color = (vehiculo.color || '').toLowerCase();
    const anio = (vehiculo.anio || '').toString();

    return (
      placa.includes(busqueda) || marca.includes(busqueda) ||
      modelo.includes(busqueda) || color.includes(busqueda) || anio.includes(busqueda)
    );
  });
});

function formatFecha(timestamp) {
  if (!timestamp) return 'No registrada';
  return new Date(timestamp).toLocaleDateString('es-MX');
}

function verDetalle(id){
  router.push({ name: 'vehiculoDetalle', params: { id }, query: { modo: 'editar' } });
}

// --- NUEVAS FUNCIONES DE ELIMINACIÓN ---

// 1. Eliminar un solo vehículo
async function eliminarVehiculo(id) {
  // Confirmación de seguridad
  if (!confirm('⚠️ ¿Estás seguro de eliminar este vehículo permanentemente? Esta acción no se puede deshacer.')) {
    return;
  }

  try {
    await axios.delete(`http://localhost:3000/api/vehiculos/${id}`);
    mensajeSistema.value = 'Vehículo eliminado correctamente.';
    cargarInventario(); // Recargamos la lista
    
    // Borramos el mensaje a los 3 segundos
    setTimeout(() => mensajeSistema.value = '', 3000);
  } catch (error) {
    alert('Error al eliminar el vehículo');
    console.error(error);
  }
}

// 2. Mantenimiento masivo (Liberados > 7 días)
async function limpiarRegistrosViejos() {
  if (!confirm('🧹 ¿Eliminar PERMANENTEMENTE todos los registros que fueron liberados hace más de 7 días?')) {
    return;
  }
  
  try {
    const response = await axios.delete('http://localhost:3000/api/maintenance/clean-releases');
    mensajeSistema.value = response.data.message;
    cargarInventario();
    setTimeout(() => mensajeSistema.value = '', 5000);
  } catch (error) {
    alert('Error en mantenimiento');
  }
}
</script>

<template>
  <div class="inventario-view">
    <div class="header-banner">
      <div class="banner-info">
        <h1>🚗 Inventario Actual</h1>
        <p>Administración y control de vehículos.</p>
      </div>
      
      <div class="search-bar-container">
        <input 
          type="text" v-model="terminoBusqueda" 
          placeholder="Buscar por placa, marca..." class="search-input"
        >
      </div>
    </div>

    <div class="admin-toolbar">
        <button @click="limpiarRegistrosViejos" class="btn-maintenance">
            🧹 Limpiar Liberados Antiguos
        </button>
        <span v-if="mensajeSistema" class="mensaje-exito">{{ mensajeSistema }}</span>
    </div>

    <table class="inventario-table">
      <thead>
        <tr>
          <th>Imagen</th>
          <th>Placa</th>
          <th>Marca</th>
          <th>Modelo</th>
          <th>Año</th>
          <th>Fecha</th>
          <th>Acciones</th> </tr>
      </thead>
      <tbody>
        <tr 
          v-for="vehiculo in inventarioFiltrado" 
          :key="vehiculo.id" 
          @click="verDetalle(vehiculo.id)"
        >
          <td>
            <img 
              v-if="vehiculo.fotos && vehiculo.fotos.length > 0" 
              :src="`http://localhost:3000/${vehiculo.fotos[0]}`" 
              class="vehiculo-imagen"
            >
          </td>
          <td>{{ vehiculo.placa }}</td>
          <td>{{ vehiculo.marca }}</td>
          <td>{{ vehiculo.modelo }}</td>
          <td>{{ vehiculo.anio }}</td>
          <td>{{ formatFecha(vehiculo.fecha_ingreso) }}</td>
          
          <td class="acciones-td">
            <button 
                class="btn-trash" 
                @click.stop="eliminarVehiculo(vehiculo.id)"
                title="Eliminar permanentemente"
            >
                🗑️
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="inventarioFiltrado.length === 0" class="empty-message">
      <span v-if="terminoBusqueda">Sin resultados para "{{ terminoBusqueda }}".</span>
      <span v-else>No hay vehículos registrados.</span>
    </p>
  </div>
</template>

<style scoped>
/* ... Tus estilos anteriores del banner y buscador se mantienen igual ... */
.header-banner {
  background: linear-gradient(to right, #34495e, #2c3e50);
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
/* ... (copia tus estilos de .search-bar-container y .search-input aquí si se perdieron) ... */
.search-bar-container { width: 100%; max-width: 400px; }
.search-input { width: 100%; padding: 0.75rem; border-radius: 6px; border: none; }

/* ESTILOS DE LA TABLA */
.inventario-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
}
th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
  vertical-align: middle;
}
thead { background-color: #f8f9fa; }
th { font-weight: 600; }
tbody tr:hover { background-color: #f1f1f1; cursor: pointer; }

.vehiculo-imagen {
  width: 80px; height: 50px; object-fit: cover; border-radius: 4px;
}

/* --- NUEVOS ESTILOS --- */
.admin-toolbar {
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 15px;
}

.btn-maintenance {
    background-color: #e67e22;
    color: white; border: none;
    padding: 0.6rem 1rem; border-radius: 6px;
    cursor: pointer; font-weight: bold;
    transition: background-color 0.3s;
}
.btn-maintenance:hover { background-color: #d35400; }

.btn-trash {
    background-color: transparent;
    border: 1px solid #e74c3c;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 5px 10px;
    transition: all 0.2s;
}
.btn-trash:hover {
    background-color: #e74c3c;
    color: white; /* El emoji no cambia de color, pero el fondo sí */
}

.acciones-td {
    text-align: center;
}

.mensaje-exito {
    color: #27ae60;
    font-weight: bold;
    animation: fadeIn 0.5s;
}
</style>