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

<script>
import axios from 'axios';

export default {
  name: 'Reportes',
  data() {
    return {
      reporteData: [] 
    };
  },
  mounted() {
    this.obtenerReporte();
  },
  methods: {
    async obtenerReporte() {
      try {
        const respuesta = await axios.get('http://localhost:3000/api/reportes/productividad');
        this.reporteData = respuesta.data;
      } catch (error) {
        console.error("Hubo un error trayendo el reporte:", error);
      }
    }
  }
};
</script>

<style scoped>
/* El 'scoped' asegura que este diseño solo afecte a esta pantalla y no rompa lo demás */

.reportes-view {
  padding: 2rem;
  background-color: #f4f7f6; /* Un gris muy clarito para el fondo de la pantalla */
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.contenedor-reportes {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 800px;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.cabecera {
  background-color: #1e293b; /* Azul oscuro elegante */
  color: white;
  padding: 1.5rem 2rem;
}

.cabecera h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.cabecera p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.95rem;
}

.tabla-wrapper {
  padding: 2rem;
}

.tabla-corralink {
  width: 100%;
  border-collapse: collapse;
}

.tabla-corralink th {
  background-color: #f1f5f9;
  color: #334155;
  font-weight: 600;
  text-align: left;
  padding: 1rem;
  border-bottom: 2px solid #cbd5e1;
}

.tabla-corralink td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #475569;
}

/* Efecto al pasar el mouse por la fila */
.tabla-corralink tbody tr:hover {
  background-color: #f8fafc;
  transition: background-color 0.2s ease;
}

.numero-destacado {
  font-weight: 700;
  font-size: 1.1rem;
  color: #0f172a;
}

.cargando {
  text-align: center;
  color: #64748b;
  font-style: italic;
}

/* Los puntitos de colores para el estatus */
.status-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}

.dot-naranja { background-color: #f59e0b; }
.dot-verde { background-color: #10b981; }
</style>