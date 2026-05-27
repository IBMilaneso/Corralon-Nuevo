<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const pestanaActiva = ref('reclamos');
const reclamos = ref([]);
const compras = ref([]);
const cargando = ref(false);

onMounted(() => {
  cargarSolicitudes();
});

async function cargarSolicitudes() {
  cargando.value = true;
  try {
    // Intentará buscar los datos reales en el backend
    const [resReclamos, resCompras] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/admin/reclamos`),
      axios.get(`${API_BASE_URL}/api/admin/compras`)
    ]);
    reclamos.value = resReclamos.data;
    compras.value = resCompras.data;
  } catch (error) {
    console.warn("Backend no conectado aún. Cargando datos de prueba visuales...");
    // DATOS DE PRUEBA: Para que puedas ver el diseño antes de conectar SQL Server
    reclamos.value = [
      { id: 1, placa: 'XYZ-123', vehiculo: 'Nissan Versa 2015', rfc: 'VECJ880326XXX', correo: 'juan@ejemplo.com', estatus: 'Pendiente', fecha: '2026-05-27' },
      { id: 2, placa: 'RTY-459', vehiculo: 'Ford Figo 2018', rfc: 'GOMM901215YYY', correo: 'maria@ejemplo.com', estatus: 'Aprobado', fecha: '2026-05-26' }
    ];
    compras.value = [
      { id: 1, placa: 'LKC-993', vehiculo: 'Chevrolet Chevy 2010', nombre: 'Carlos Ruiz', telefono: '8671234567', estatus: 'Pendiente', fecha: '2026-05-27' }
    ];
  }
  cargando.value = false;
}

async function procesarSolicitud(tipo, id, nuevoEstatus) {
  try {
    // Mandamos la petición real al backend
    await axios.patch(`${API_BASE_URL}/api/admin/${tipo}/${id}/estatus`, { 
      estatus: nuevoEstatus 
    });
    
    // Si fue un éxito, actualizamos la tabla visualmente
    const lista = tipo === 'reclamos' ? reclamos.value : compras.value;
    const index = lista.findIndex(item => item.id === id);
    if (index !== -1) lista[index].estatus = nuevoEstatus;

  } catch (error) {
    console.error("Error al procesar:", error);
    alert("Error al actualizar la solicitud.");
  }
}
</script>

<template>
  <div class="bandeja-view">
    <div class="header-banner">
      <div class="banner-info">
        <h1>📥 Bandeja de Operaciones</h1>
        <p>Gestiona y audita las solicitudes de los ciudadanos.</p>
      </div>
    </div>

    <div class="tabs-container">
      <button 
        :class="['tab-btn', { activo: pestanaActiva === 'reclamos' }]"
        @click="pestanaActiva = 'reclamos'"
      >
        🛡️ Reclamos de Dueños
      </button>
      <button 
        :class="['tab-btn', { activo: pestanaActiva === 'compras' }]"
        @click="pestanaActiva = 'compras'"
      >
        🛒 Ofertas de Compra
      </button>
    </div>

    <div class="contenedor-tablas">
      <p v-if="cargando" class="mensaje-carga">Sincronizando con la base de datos...</p>

      <div v-if="!cargando && pestanaActiva === 'reclamos'">
        <table class="tabla-corralink">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Vehículo Solicitado</th>
              <th>Datos del Ciudadano</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reclamos" :key="item.id">
              <td>{{ item.fecha }}</td>
              <td><strong>{{ item.vehiculo }}</strong><br><small>{{ item.placa }}</small></td>
              <td>RFC: {{ item.rfc }}<br><small>{{ item.correo }}</small></td>
              <td>
                <span :class="['badge-estatus', item.estatus.toLowerCase()]">
                  {{ item.estatus }}
                </span>
              </td>
              <td>
                <div class="botones-accion" v-if="item.estatus === 'Pendiente'">
                  <button @click="procesarSolicitud('reclamos', item.id, 'Aprobado')" class="btn-aprobar" title="Aprobar">✅</button>
                  <button @click="procesarSolicitud('reclamos', item.id, 'Rechazado')" class="btn-rechazar" title="Rechazar">❌</button>
                </div>
                <span v-else class="texto-procesado">Auditado</span>
              </td>
            </tr>
            <tr v-if="reclamos.length === 0">
              <td colspan="5" class="vacio">No hay reclamos pendientes.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!cargando && pestanaActiva === 'compras'">
        <table class="tabla-corralink">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Vehículo Solicitado</th>
              <th>Datos del Comprador</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in compras" :key="item.id">
              <td>{{ item.fecha }}</td>
              <td><strong>{{ item.vehiculo }}</strong><br><small>{{ item.placa }}</small></td>
              <td>{{ item.nombre }}<br><small>Tel: {{ item.telefono }}</small></td>
              <td>
                <span :class="['badge-estatus', item.estatus.toLowerCase()]">
                  {{ item.estatus }}
                </span>
              </td>
              <td>
                <div class="botones-accion" v-if="item.estatus === 'Pendiente'">
                  <button @click="procesarSolicitud('compras', item.id, 'Aprobado')" class="btn-aprobar" title="Aprobar">✅</button>
                  <button @click="procesarSolicitud('compras', item.id, 'Rechazado')" class="btn-rechazar" title="Rechazar">❌</button>
                </div>
                <span v-else class="texto-procesado">Auditado</span>
              </td>
            </tr>
            <tr v-if="compras.length === 0">
              <td colspan="5" class="vacio">No hay ofertas de compra.</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

.bandeja-view {
  padding: 1.5rem;
  font-family: 'Montserrat', sans-serif;
  animation: fadeIn 0.5s ease;
}

.header-banner {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  color: white;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
.banner-info h1 { margin: 0; font-size: 1.8rem; font-weight: 700;}
.banner-info p { margin: 0.5rem 0 0; color: #94a3b8; font-size: 0.95rem; }

/* TABS */
.tabs-container {
  display: flex;
  gap: 10px;
  margin-bottom: 1.5rem;
}
.tab-btn {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #cbd5e1;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}
.tab-btn:hover { background: #e2e8f0; }
.tab-btn.activo {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
}

/* CONTENEDOR TABLA */
.contenedor-tablas {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  overflow-x: auto;
}

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
}
.tabla-corralink td {
  padding: 1rem 1.2rem;
  border-bottom: 1px solid #f1f5f9;
  color: #475569;
  vertical-align: middle;
}
.tabla-corralink strong { color: #0f172a; }

/* BADGES DE ESTATUS */
.badge-estatus {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
}
.badge-estatus.pendiente { background: #fef3c7; color: #d97706; }
.badge-estatus.aprobado { background: #d1fae5; color: #059669; }
.badge-estatus.rechazado { background: #fee2e2; color: #dc2626; }

/* BOTONES ACCIÓN */
.botones-accion { display: flex; gap: 8px; }
.botones-accion button {
  width: 35px; height: 35px; border-radius: 6px; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 1.1rem; transition: transform 0.2s;
}
.btn-aprobar { background: #10b981; }
.btn-rechazar { background: #ef4444; }
.botones-accion button:hover { transform: scale(1.1); }
.texto-procesado { color: #94a3b8; font-style: italic; font-size: 0.9rem; }

.mensaje-carga { text-align: center; color: #64748b; padding: 2rem; font-weight: 600;}
.vacio { text-align: center; color: #94a3b8; font-style: italic; padding: 2rem !important; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>