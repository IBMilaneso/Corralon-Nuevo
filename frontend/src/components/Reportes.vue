<template>
  <div class="reportes-view">
    <div class="contenedor-reportes">
      
      <div class="cabecera">
        <h2>📊 Reporte de Productividad</h2>
        <p>Resumen del estado actual del patio del corralón.</p>
      </div>

      <div class="tabla-wrapper">
        <table class="tabla-corralink">
          <thead>
            <tr>
              <th>Estatus del Vehículo</th>
              <th>Total en Patio</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="reporteData.length === 0">
              <td colspan="2" class="cargando">Cargando datos del servidor...</td>
            </tr>
            
            <tr v-for="(fila, index) in reporteData" :key="index">
              <td>
                <span 
                  class="status-dot" 
                  :class="fila.EstadoActual === 'Liberado' ? 'dot-verde' : 'dot-naranja'">
                </span>
                {{ fila.EstadoActual }}
              </td>
              <td class="numero-destacado">{{ fila.TotalVehiculos }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Variable reactiva en Vue 3
const reporteData = ref([]);

// Cuando la pantalla cargue, pedimos los datos al backend
onMounted(async () => {
  try {
    const respuesta = await fetch('http://localhost:3000/api/reportes/productividad');
    if (respuesta.ok) {
      reporteData.value = await respuesta.json();
    } else {
      console.error('Error al obtener reporte del servidor');
    }
  } catch (error) {
    console.error('Error de conexión con el backend:', error);
  }
});
</script>

<style scoped>
.reportes-view {
  padding: 2rem;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  color: #333; /* Para asegurar que el texto se vea en tu fondo oscuro */
}

.contenedor-reportes {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 800px;
  overflow: hidden;
  font-family: Arial, sans-serif;
}

.cabecera {
  background-color: #2c3e50; /* Mismo color que tu sidebar */
  color: white;
  padding: 1.5rem 2rem;
}

.cabecera h2 { margin: 0 0 0.5rem 0; font-size: 1.5rem; }
.cabecera p { margin: 0; color: #bdc3c7; font-size: 0.95rem; }

.tabla-wrapper { padding: 2rem; }
.tabla-corralink { width: 100%; border-collapse: collapse; }
.tabla-corralink th {
  background-color: #f1f5f9; color: #334155;
  font-weight: bold; text-align: left; padding: 1rem;
  border-bottom: 2px solid #cbd5e1;
}
.tabla-corralink td {
  padding: 1rem; border-bottom: 1px solid #e2e8f0; color: #475569;
}
.tabla-corralink tbody tr:hover { background-color: #f8fafc; }
.numero-destacado { font-weight: bold; font-size: 1.1rem; color: #0f172a; }
.cargando { text-align: center; color: #64748b; font-style: italic; }

.status-dot {
  display: inline-block; width: 10px; height: 10px;
  border-radius: 50%; margin-right: 8px;
}
.dot-naranja { background-color: #f59e0b; }
.dot-verde { background-color: #10b981; }
</style>