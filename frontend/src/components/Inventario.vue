<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';
const inventario = ref([]);
const router = useRouter();
const terminoBusqueda = ref('');
const mensajeSistema = ref('');

async function cargarInventario() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/vehiculos`);
    inventario.value = response.data;
  } catch (error) {
    console.error('Error al obtener el inventario:', error);
  }
}

onMounted(() => {
  cargarInventario();
});

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

async function eliminarVehiculo(id) {
  if (!confirm('⚠️ ¿Estás seguro de eliminar este vehículo permanentemente? Esta acción no se puede deshacer.')) {
    return;
  }

  try {
    await axios.delete(`${API_BASE_URL}/api/vehiculos/${id}`);
    mensajeSistema.value = 'Vehículo eliminado correctamente.';
    cargarInventario();
    setTimeout(() => mensajeSistema.value = '', 3000);
  } catch (error) {
    alert('Error al eliminar el vehículo');
    console.error(error);
  }
}

async function limpiarRegistrosViejos() {
  if (!confirm('🧹 ¿Eliminar PERMANENTEMENTE todos los registros que fueron liberados hace más de 7 días?')) {
    return;
  }
  
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/maintenance/clean-releases`);
    mensajeSistema.value = response.data.message;
    cargarInventario();
    setTimeout(() => mensajeSistema.value = '', 5000);
  } catch (error) {
    alert('Error en mantenimiento');
  }
}

function getImageUrl(rutaOriginal) {
  if (!rutaOriginal) return '';
  const rutaCorregida = rutaOriginal.replace(/\\/g, '/');
  return `${API_BASE_URL}/${rutaCorregida}`;
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
          type="text" 
          v-model="terminoBusqueda" 
          placeholder="Buscar por placa, marca, color..." 
          class="search-input"
        >
      </div>
    </div>

    <div class="admin-toolbar">
        <button @click="limpiarRegistrosViejos" class="btn-maintenance">
            <span class="icon">🧹</span> Limpiar Liberados Antiguos
        </button>
        <span v-if="mensajeSistema" class="mensaje-exito">{{ mensajeSistema }}</span>
    </div>

    <div class="table-container">
      <table class="inventario-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Placa</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Año</th>
            <th>Fecha</th>
            <th>Multa</th> <th class="center-text">Acciones</th> 
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="vehiculo in inventarioFiltrado" 
            :key="vehiculo.id" 
            @click="verDetalle(vehiculo.id)"
          >
            <td>
              <div class="img-wrapper">
                <img 
                  v-if="vehiculo.fotos && vehiculo.fotos.length > 0" 
                  :src="getImageUrl(vehiculo.fotos[0])" 
                  class="vehiculo-imagen"
                >
                <div v-else class="vehiculo-placeholder">🚗</div>
              </div>
            </td>
            <td class="resaltado">{{ vehiculo.placa }}</td>
            <td>{{ vehiculo.marca }}</td>
            <td>{{ vehiculo.modelo }}</td>
            <td>{{ vehiculo.anio }}</td>
            <td class="fecha-text">{{ formatFecha(vehiculo.fecha_ingreso) }}</td>
            
            <td class="resaltado" style="color: #ef4444;">
              {{ vehiculo.deuda_inicial ? '$' + vehiculo.deuda_inicial.toLocaleString('es-MX') + ' MXN' : 'Por calcular' }}
            </td>
            
            <td class="acciones-td center-text">
              <button 
                  class="btn-trash" 
                  @click.stop="eliminarVehiculo(vehiculo.id)"
                  title="Eliminar permanentemente"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="inventarioFiltrado.length === 0" class="empty-message">
      <span v-if="terminoBusqueda">No encontramos coincidencias para "{{ terminoBusqueda }}".</span>
      <span v-else>El inventario está vacío en este momento.</span>
    </p>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.inventario-view {
  font-family: 'Outfit', sans-serif;
  animation: fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  padding-bottom: 2rem;
}

/* --- BANNER Y BÚSQUEDA --- */
.header-banner {
  background: rgba(15, 23, 42, 0.6); 
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05); 
  color: white;
  padding: 2rem 2.5rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-banner h1 { margin: 0; font-size: 2.2rem; letter-spacing: -0.5px; font-weight: 700; color: #f8fafc; }
.header-banner p { margin: 0.5rem 0 0; color: #94a3b8; font-size: 1.1rem; }

.search-bar-container { width: 100%; max-width: 450px; }
.search-input {
  width: 100%;
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  font-family: 'Outfit', sans-serif;
  border-radius: 12px;
  box-sizing: border-box;
  border: 1px solid #334155;
  background-color: rgba(15, 23, 42, 0.8);
  color: #f8fafc;
  transition: all 0.3s ease;
}
.search-input::placeholder { color: #64748b; }
.search-input:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); }

/* --- TOOLBAR --- */
.admin-toolbar { margin-bottom: 1.5rem; display: flex; align-items: center; gap: 15px; }
.btn-maintenance {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 0.6rem 1.2rem; 
  border-radius: 8px;
  cursor: pointer; 
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  transition: all 0.3s;
  display: flex; align-items: center; gap: 8px;
}
.btn-maintenance:hover { background: rgba(245, 158, 11, 0.2); border-color: #f59e0b; box-shadow: 0 0 15px rgba(245, 158, 11, 0.2); }

/* --- CONTENEDOR DE LA TABLA --- */
.table-container {
  background: rgba(30, 41, 59, 0.7); 
  backdrop-filter: blur(10px);
  border-radius: 16px; 
  border: 1px solid rgba(255, 255, 255, 0.05); 
  overflow: hidden; /* Mantiene los bordes redondeados */
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.inventario-table { width: 100%; border-collapse: collapse; }

th, td {
  padding: 1.2rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  vertical-align: middle;
}

thead { background: rgba(15, 23, 42, 0.9); }
th { 
  font-weight: 600; 
  color: #94a3b8; 
  text-transform: uppercase; 
  font-size: 0.85rem; 
  letter-spacing: 1px; 
}

tbody tr { transition: all 0.2s ease; color: #cbd5e1; font-size: 1.05rem; }
tbody tr:hover { background: rgba(51, 65, 85, 0.5); cursor: pointer; }
tbody tr:last-child td { border-bottom: none; }

.resaltado { color: #f8fafc; font-weight: 600; letter-spacing: 0.5px; }
.fecha-text { color: #64748b; font-size: 0.95rem; }
.center-text { text-align: center; }

/* --- IMÁGENES DE LA TABLA --- */
.img-wrapper { width: 140px; height: 80px; border-radius: 8px; overflow: hidden; background: #0f172a; border: 1px solid #334155; }
.vehiculo-imagen { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
tbody tr:hover .vehiculo-imagen { transform: scale(1.05); }
.vehiculo-placeholder { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; font-size: 2rem; opacity: 0.5; }

/* --- BOTÓN ELIMINAR (EL TRUCO ROJO MODERNIZADO) --- */
.btn-trash {
  background-color: transparent;
  color: #ef4444;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  padding: 8px;
  transition: all 0.2s;
  display: inline-flex; align-items: center; justify-content: center;
}
.btn-trash:hover { background-color: rgba(239, 68, 68, 0.1); border-color: #ef4444; box-shadow: 0 0 10px rgba(239, 68, 68, 0.2); }

/* Efecto de Alerta de Fila */
tbody tr:has(.btn-trash:hover) {
  background: rgba(220, 38, 38, 0.15) !important;
  border-left: 4px solid #ef4444;
  box-shadow: inset 0 0 20px rgba(239, 68, 68, 0.1);
}
tbody tr:has(.btn-trash:hover) td { color: #fca5a5; }

/* --- MENSAJES --- */
.mensaje-exito { color: #10b981; font-weight: 600; font-size: 0.95rem; background: rgba(16, 185, 129, 0.1); padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.2); animation: fadeIn 0.4s; }
.empty-message { text-align: center; margin-top: 3rem; font-size: 1.2rem; color: #64748b; font-weight: 500; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>