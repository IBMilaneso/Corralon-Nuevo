<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import ModalDetalleVehiculo from '../components/ModalDetalleVehiculo.vue';
import ModalReclamo from '../components/ModalReclamo.vue'; 
import ModalCompra from '../components/ModalCompra.vue'; // <-- Importado correctamente

const API_BASE_URL = 'http://localhost:3000';

const stats = ref({
  totalVehiculos: 0,
  ingresosHoy: 0,
  liberadosHoy: 0
});

const inventario = ref([]);
const filtroSeleccionado = ref('Recientes');

// Variables para el Modal de Detalle
const vehiculoSeleccionado = ref(null);
const mostrarModalDetalle = ref(false);
const esInvitado = ref(true); // <-- CAMBIADO A TRUE para que salgan los botones

// Variables para los Modales de Acción
const mostrarModalReclamo = ref(false);
const mostrarModalCompra = ref(false); // <-- Variable correcta

onMounted(async () => {
  try {
    const [statsRes, inventarioRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/stats`),
      axios.get(`${API_BASE_URL}/api/vehiculos`)
    ]);

    stats.value = statsRes.data;
    inventario.value = inventarioRes.data;

  } catch (error) {
    console.error('Error al cargar los datos del dashboard:', error);
  }
});

const inventarioFiltrado = computed(() => {
    let resultado = [...inventario.value];

    if (filtroSeleccionado.value === 'Venta') {
        resultado = resultado.filter(v => v.estatus === 'Para vender');
    } else if (filtroSeleccionado.value === 'Sin especificar') {
        resultado = resultado.filter(v => v.estatus === 'Sin especificar');
    }

    if (filtroSeleccionado.value === 'Viejos') {
        resultado.reverse();
    }
    
    return resultado;
});

function abrirModal(vehiculo) {
  vehiculoSeleccionado.value = vehiculo;
  mostrarModalDetalle.value = true;
}

function getImageUrl(rutaOriginal) {
  if (!rutaOriginal) return '';
  const rutaCorregida = rutaOriginal.replace(/\\/g, '/');
  return `${API_BASE_URL}/${rutaCorregida}`;
}

// <-- FUNCIONES PUENTE PARA LOS BOTONES -->
function iniciarReclamo(vehiculo) {
  mostrarModalDetalle.value = false; // Cerramos el de fotos
  vehiculoSeleccionado.value = vehiculo; // Pasamos el carro
  mostrarModalReclamo.value = true; // Abrimos el formulario
}

// Función duplicada ELIMINADA, dejamos solo la que abre el modal
function manejarCompra() {
  mostrarModalDetalle.value = false; // Cierra la galería
  mostrarModalCompra.value = true;   // Abre el formulario de compra
} 

async function enviarReclamoAlServidor(datosReclamo) {
  try {
    const payload = { ...datosReclamo, vehiculoId: vehiculoSeleccionado.value.id };
    await axios.post(`${API_BASE_URL}/api/reclamos`, payload);
    mostrarModalReclamo.value = false;
    alert("¡Tu solicitud de reclamo ha sido enviada con éxito!");
  } catch (error) {
    console.error("Error al enviar reclamo:", error);
    alert("Hubo un error al enviar tu solicitud.");
  }
}

// Enviar la compra al Backend
async function enviarCompraAlServidor(datosCompra) {
  try {
    const payload = { ...datosCompra, vehiculoId: vehiculoSeleccionado.value.id };
    await axios.post(`${API_BASE_URL}/api/compras`, payload);
    mostrarModalCompra.value = false;
    alert("¡Tu interés de compra ha sido registrado!");
  } catch (error) {
    console.error("Error al enviar compra:", error);
    alert("Hubo un error al enviar tu solicitud.");
  }
}

</script>

<template>
  <div class="dashboard-view">
    
    <div class="header-banner">
      <h1>Dashboard: Corralón Nuevo Laredo</h1>
      <p>Resumen de la operación del día.</p>
    </div>
    
    <div class="stats-container">
      <div class="stat-card">
        <h2>{{ stats.totalVehiculos }}</h2>
        <p>Vehículos en Corralón</p>
      </div>
      <div class="stat-card green">
        <h2>{{ stats.ingresosHoy }}</h2>
        <p>Ingresados Hoy</p>
      </div>
      <div class="stat-card red">
        <h2>{{ stats.liberadosHoy }}</h2>
        <p>Liberados Hoy</p>
      </div>
    </div>

    <div class="filter-controls">
        <label for="filtro">Filtrar:</label>
        <select id="filtro" v-model="filtroSeleccionado" class="filter-select">
            <option value="Recientes">📅 Más Recientes</option>
            <option value="Viejos">⏳ Más Viejos</option>
            <option disabled>--- ESTATUS ---</option>
            <option value="Venta">💰 En Venta</option>
            <option value="Sin especificar">❓ Sin Especificar</option>
        </select>
    </div>
    
    <div class="gallery-header">
      <h2>Vehículos en el Corralón:</h2>
      <p>Mostrando {{ inventarioFiltrado.length }} de {{ inventario.length }} vehículos</p>
    </div>

    <div class="vehiculo-grid horizontal-layout">
      <div 
        v-for="vehiculo in inventarioFiltrado" 
        :key="vehiculo.id" 
        class="vehiculo-card" 
        @click="abrirModal(vehiculo)"
      >
        <div class="card-img-container">
          <img 
            v-if="vehiculo.fotos && vehiculo.fotos.length > 0" 
            :src="getImageUrl(vehiculo.fotos[0])" 
            alt="Foto del vehículo" 
            class="card-img"
          >
          <div v-else class="card-img-placeholder">
            <span>🚗</span>
          </div>
        </div>
        
        <div class="card-details">
          <div class="details-header">
            <h4>{{ vehiculo.marca }} {{ vehiculo.modelo }}</h4>
            <button class="btn-opciones">•••</button>
          </div>
          
          <div class="details-body">
            <div class="info-row">
              <span class="icono-dato">📅</span>
              <p>Año: <strong>{{ vehiculo.anio }}</strong></p>
            </div>
            
            <div class="estatus-container">
              <span class="estatus-dot" :class="vehiculo.estatus === 'Para vender' ? 'verde' : 'amarillo'"></span>
              <p class="estatus-texto">{{ vehiculo.estatus || 'Sin especificar' }}</p>
            </div>
          </div>
          
          <div class="details-footer">
             <span class="badge-accion">Hacer clic para ver detalles</span>
          </div>
        </div>
      </div>
    </div>
    
    <p v-if="inventarioFiltrado.length === 0" class="empty-message">Aún no hay vehículos registrados.</p>

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
      :vehiculo="vehiculoSeleccionado" 
      @cerrar="mostrarModalReclamo = false"
      @enviarReclamo="enviarReclamoAlServidor"
    />

    <ModalCompra 
      :mostrar="mostrarModalCompra" 
      :vehiculo="vehiculoSeleccionado" 
      @cerrar="mostrarModalCompra = false"
      @enviarCompra="enviarCompraAlServidor"
    />

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.dashboard-view { 
  font-family: 'Outfit', sans-serif; 
  padding-bottom: 2rem;
  animation: fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1); 
}

/* 1. HEADER BANNER - Efecto Cristal Oscuro */
.header-banner { 
  background: rgba(15, 23, 42, 0.6); 
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05); 
  color: white; 
  padding: 2rem 2.5rem; 
  border-radius: 16px; 
  margin-bottom: 2rem; 
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); 
}
.header-banner h1 { margin: 0; font-size: 2.2rem; letter-spacing: -0.5px; font-weight: 700; color: #f8fafc; }
.header-banner p { margin: 0.5rem 0 0; color: #94a3b8; font-size: 1.1rem; }

/* 2. TARJETAS DE ESTADÍSTICAS - Rediseño estilo telemetría */
.stats-container { display: flex; gap: 1.5rem; margin-bottom: 2rem; }
.stat-card { 
  background: rgba(30, 41, 59, 0.7); 
  backdrop-filter: blur(10px);
  padding: 1.5rem 2rem; 
  border-radius: 16px; 
  border: 1px solid rgba(255, 255, 255, 0.05); 
  border-left: 5px solid #3b82f6; /* Acento de color en el borde izquierdo */
  flex-grow: 1; 
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}
.stat-card:hover { 
  transform: translateY(-5px); 
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3); 
}
.stat-card h2 { font-size: 3rem; margin: 0; color: #f8fafc; font-weight: 700; line-height: 1; }
.stat-card p { margin: 0.5rem 0 0; color: #cbd5e1; font-weight: 500; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }

/* Colores brillantes para los números y bordes */
.stat-card.green { border-left-color: #10b981; }
.stat-card.green h2 { color: #10b981; text-shadow: 0 0 20px rgba(16, 185, 129, 0.4); } /* Brillo de neón suave */

.stat-card.red { border-left-color: #ef4444; }
.stat-card.red h2 { color: #ef4444; text-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }

/* 3. FILTROS - Integrados al tema oscuro */
.filter-controls { 
  display: inline-flex; align-items: center; gap: 12px; 
  background: rgba(15, 23, 42, 0.4);
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 1rem;
}
.filter-controls label { font-weight: 600; color: #cbd5e1; font-size: 0.95rem; }
.filter-select { 
  padding: 0.5rem 1rem; border-radius: 8px; 
  border: 1px solid #334155; background: #1e293b; 
  color: #f8fafc; font-size: 0.95rem; cursor: pointer;
  transition: border 0.3s, box-shadow 0.3s;
}
.filter-select:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3); }

/* Titulo de la Galería */
.gallery-header { margin-top: 2rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.8rem; }
.gallery-header h2 { margin: 0; color: #f8fafc; font-size: 1.5rem; }
.gallery-header p { margin: 0; color: #94a3b8; font-weight: 500; }
.empty-message { text-align: center; margin-top: 2rem; font-size: 1.1rem; color: #94a3b8; }

/* ... (Aquí dejas intacta la parte de "NUEVO LAYOUT HORIZONTAL ESTILO PANEL" en adelante) ... */

/* --- NUEVO LAYOUT HORIZONTAL ESTILO PANEL --- */
.vehiculo-grid.horizontal-layout { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); 
  gap: 1.5rem; 
}

.vehiculo-card { 
  display: flex; 
  background: #1e293b; 
  border: 1px solid #334155;
  border-radius: 12px; 
  overflow: hidden; 
  cursor: pointer; 
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);
}

.vehiculo-card:hover { 
  transform: translateY(-3px); 
  border-color: #475569;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.4); 
}

.card-img-container { width: 40%; min-width: 180px; position: relative; }
.card-img { width: 100%; height: 100%; object-fit: cover; }
.card-img-placeholder { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background-color: #0f172a; }

.card-details { width: 60%; padding: 1.2rem; display: flex; flex-direction: column; justify-content: space-between; }
.details-header { display: flex; justify-content: space-between; align-items: flex-start; }
.details-header h4 { margin: 0; font-size: 1.2rem; color: #f8fafc; font-weight: 600; }
.btn-opciones { background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 1.2rem; }

.details-body { margin-top: 1rem; flex-grow: 1; }
.info-row { display: flex; align-items: center; gap: 8px; margin-bottom: 0.5rem; }
.info-row p { margin: 0; color: #cbd5e1; font-size: 0.95rem; }
.icono-dato { font-size: 1rem; opacity: 0.8; }

.estatus-container {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(15, 23, 42, 0.5);
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  margin-top: 0.8rem;
  border: 1px solid #334155;
}
.estatus-dot { width: 10px; height: 10px; border-radius: 50%; }
.estatus-dot.verde { background-color: #22c55e; box-shadow: 0 0 8px #22c55e; }
.estatus-dot.amarillo { background-color: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
.estatus-texto { margin: 0; color: #e2e8f0; font-size: 0.85rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }

.details-footer { margin-top: 1rem; border-top: 1px solid #334155; padding-top: 0.8rem; }
.badge-accion { color: #3b82f6; font-size: 0.8rem; font-weight: 600; }

@media (max-width: 768px) {
  .vehiculo-card { flex-direction: column; }
  .card-img-container { width: 100%; height: 200px; }
  .card-details { width: 100%; }
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>