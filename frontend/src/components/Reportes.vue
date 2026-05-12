<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- Cambio 1: Importación correcta

const API_BASE_URL = 'http://localhost:3000';
const reporteData = ref([]);

onMounted(async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/reportes/productividad`);
    reporteData.value = response.data;
  } catch (error) {
    console.error('Error al cargar el reporte:', error);
  }
});

async function descargarPDF() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/vehiculos`);
    let vehiculos = response.data;

    vehiculos.sort((a, b) => b.anio - a.anio);

    const doc = new jsPDF('l', 'pt', 'a4');

    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('CORRALINK - Reporte de Inventario Detallado', 40, 40);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    const fecha = new Date().toLocaleDateString('es-MX');
    doc.text(`Generado el: ${fecha} | Nuevo Laredo, Tamaulipas`, 40, 60);

    const tablaColumnas = ["Placa", "Marca", "Modelo", "Año", "Color", "Estatus"];
    const tablaFilas = vehiculos.map(v => [
      v.placa, v.marca, v.modelo, v.anio.toString(), v.color, v.estatus || 'Sin especificar'
    ]);

    // <-- Cambio 2: Uso correcto de autoTable para Vue/Vite
    autoTable(doc, {
      startY: 80,
      head: [tablaColumnas],
      body: tablaFilas,
      theme: 'grid',
      headStyles: { fillColor: [44, 62, 80], textColor: 255 },
      styles: { fontSize: 10 }
    });

    doc.save(`Reporte_Corralink_${fecha.replace(/\//g, '-')}.pdf`);
  } catch (error) {
    console.error('Error en PDF:', error);
    alert('No se pudo generar el PDF. Verifica la conexión con el servidor.');
  }
}
</script>

<template>
  <div class="reportes-view">
    <div class="header-banner">
      <div class="banner-info">
        <h1>📈 Gestión de Reportes</h1>
        <p>Consulta estadísticas en tiempo real y descarga documentos oficiales.</p>
      </div>
      <button @click="descargarPDF" class="btn-pdf">
        <span>📄</span> Descargar Inventario PDF
      </button>
    </div>

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

<style scoped>
.reportes-view {
  padding: 1.5rem;
  animation: fadeIn 0.5s ease-in-out;
}

/* Estilos del Banner de Descarga */
.header-banner {
  background: linear-gradient(to right, #2c3e50, #0a0e12);
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.banner-info h1 { margin: 0; font-size: 1.8rem; }
.banner-info p { margin: 0.5rem 0 0; opacity: 0.8; }

.btn-pdf {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-pdf:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

/* Estilos de tu Tabla Original */
.contenedor-reportes {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.cabecera h2 { color: #2c3e50; margin: 0; }
.cabecera p { color: #7f8c8d; margin: 0.5rem 0 1.5rem 0; }

.tabla-corralink {
  width: 100%;
  border-collapse: collapse;
}

.tabla-corralink th {
  background-color: #f8f9fa;
  color: #2c3e50;
  text-align: left;
  padding: 1rem;
  border-bottom: 2px solid #dee2e6;
}

.tabla-corralink td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  color: #333;
}

.numero-destacado {
  font-weight: bold;
  font-size: 1.2rem;
  color: #2c3e50;
}

.status-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 10px;
}

.dot-verde { background-color: #27ae60; }
.dot-naranja { background-color: #f39c12; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>