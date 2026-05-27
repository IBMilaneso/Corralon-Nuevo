<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

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

    // Ordenamos por fecha de ingreso (los más recientes primero)
    vehiculos.sort((a, b) => new Date(b.fecha_ingreso) - new Date(a.fecha_ingreso));

    const doc = new jsPDF('l', 'pt', 'a4');

    // --- ENCABEZADO OFICIAL STEP ---
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59); // Gris muy oscuro (Casi negro)
    doc.text('STEP', 40, 50);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text('Reporte Oficial de Inventario y Deuda', 40, 75);
    
    doc.setFontSize(10);
    const fechaActual = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Generado el: ${fechaActual} | Nuevo Laredo, Tamaulipas`, 40, 95);

    // --- LÍNEA SEPARADORA ---
    doc.setLineWidth(1);
    doc.setDrawColor(203, 213, 225);
    doc.line(40, 105, 800, 105);

    // --- DEFINICIÓN DE COLUMNAS PARA LA TABLA ---
    const tablaColumnas = ["Placa", "Marca y Modelo", "Año", "Fecha de Ingreso", "Estatus", "Multa / Deuda"];
    
    // --- MAPEO DE DATOS ---
    const tablaFilas = vehiculos.map(v => {
      // Formatear Fecha
      let fechaIngreso = 'Sin registro';
      if (v.fecha_ingreso) {
        const dateObj = new Date(v.fecha_ingreso);
        fechaIngreso = dateObj.toLocaleDateString('es-MX');
      }

      // Formatear Moneda
      const deudaFormateada = v.deuda_inicial 
        ? `$${v.deuda_inicial.toLocaleString('es-MX')} MXN` 
        : '$0 MXN';

      return [
        v.placa, 
        `${v.marca} ${v.modelo}`, 
        v.anio ? v.anio.toString() : 'N/A', 
        fechaIngreso,
        v.estatus || 'Sin especificar',
        deudaFormateada
      ];
    });

    // --- GENERACIÓN DE LA TABLA ---
    autoTable(doc, {
      startY: 120,
      head: [tablaColumnas],
      body: tablaFilas,
      theme: 'grid',
      headStyles: { 
        fillColor: [241, 245, 249], // Fondo gris muy claro
        textColor: [30, 41, 59],    // Texto oscuro
        fontStyle: 'bold',
        lineWidth: 1,
        lineColor: [203, 213, 225]
      },
      bodyStyles: {
        textColor: [51, 65, 85],
        lineWidth: 1,
        lineColor: [226, 232, 240]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Sutil cebra
      },
      columnStyles: {
        5: { fontStyle: 'bold', halign: 'right', textColor: [220, 38, 38] } // Columna de Deuda (Alineada a la derecha y roja)
      },
      styles: { 
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 6
      }
    });

    // --- GUARDAR ARCHIVO ---
    const fechaCorta = new Date().toLocaleDateString('es-MX').replace(/\//g, '-');
    doc.save(`Inventario_STEP_${fechaCorta}.pdf`);
    
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
        <p>Consulta estadísticas en tiempo real y descarga documentos oficiales de STEP.</p>
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
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

.reportes-view {
  padding: 1.5rem;
  font-family: 'Montserrat', sans-serif;
  animation: fadeIn 0.5s ease-in-out;
}

/* Estilos del Banner de Descarga */
.header-banner {
  background: linear-gradient(to right, #1e293b, #0f172a);
  color: white;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.banner-info h1 { margin: 0; font-size: 1.8rem; font-weight: 700;}
.banner-info p { margin: 0.5rem 0 0; color: #94a3b8; font-size: 0.95rem; }

.btn-pdf {
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 1rem 1.8rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-pdf:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

/* Estilos de tu Tabla Original */
.contenedor-reportes {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

.cabecera h2 { color: #1e293b; margin: 0; font-weight: 700; }
.cabecera p { color: #64748b; margin: 0.5rem 0 2rem 0; }

.tabla-corralink {
  width: 100%;
  border-collapse: collapse;
}

.tabla-corralink th {
  background-color: #f8fafc;
  color: #334155;
  text-align: left;
  padding: 1.2rem;
  border-bottom: 2px solid #e2e8f0;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.tabla-corralink td {
  padding: 1.2rem;
  border-bottom: 1px solid #f1f5f9;
  color: #475569;
  font-weight: 500;
}

.numero-destacado {
  font-weight: 700;
  font-size: 1.2rem;
  color: #0f172a;
}

.status-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 12px;
}

.dot-verde { background-color: #10b981; }
.dot-naranja { background-color: #f59e0b; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>