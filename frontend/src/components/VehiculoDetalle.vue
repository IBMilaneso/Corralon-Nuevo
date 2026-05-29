<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import EditarVehiculo from './EditarVehiculo.vue';
import { reactive } from 'vue';
import ModalReclamo from './ModalReclamo.vue'; // (Si lo vas a usar después)

const API_BASE_URL = 'http://localhost:3000';
const route = useRoute();
const puedeEditar = computed(() => route.query.modo === 'editar');
const router = useRouter();

const vehiculo = ref(null);
const vehiculoId = route.params.id;
const mostrarEditor = ref(false);

const isModalVisible = ref(false);
const selectedImageUrl = ref('');

const estatusOpciones = ['Sin especificar', 'Para triturar', 'Para vender', 'Liberado'];
const estatusMensaje = ref('');

const mostrarModalCita = ref(false);
const datosCita = reactive({
  nombre: '',
  rfc: '',
  licencia: '',
  correo: ''
});
const mostrarBotonCita = computed(() => {
  return !puedeEditar.value && vehiculo.value?.estatus === 'Para vender';
});

function agendarCita() {
  console.log("--- CITA AGENDADA TEMPORALMENTE ---");
  console.log(datosCita);
  alert(`Cita agendada para ${datosCita.nombre}. (Datos guardados en memoria)`);
  
  mostrarModalCita.value = false;
  Object.assign(datosCita, { nombre: '', rfc: '', licencia: '', correo: '' });
}

onMounted(async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/vehiculos/${vehiculoId}`);
    vehiculo.value = response.data;
    
    if (!vehiculo.value.estatus) {
      vehiculo.value.estatus = 'Sin especificar';
    }
    
  } catch (error) {
    console.error('Error al cargar los detalles del vehículo:', error);
  }
});

function regresar() {
  router.back();
}

function openModal(imageUrl) {
  selectedImageUrl.value = imageUrl;
  isModalVisible.value = true;
}

function closeModal() {
  isModalVisible.value = false;
}

async function actualizarEstatus() {
  if (!vehiculo.value) return;

  try {
    estatusMensaje.value = 'Guardando...';
    const nuevoEstatus = vehiculo.value.estatus;

    await axios.patch(`${API_BASE_URL}/api/vehiculos/${vehiculo.value.id}/estatus`, {
      estatus: nuevoEstatus
    });

    if (nuevoEstatus === 'Liberado') {
      estatusMensaje.value = '¡Liberado! Oculto del inventario. Eliminación en 7 días.';
    } else {
      estatusMensaje.value = '¡Estatus actualizado con éxito!';
    }
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      estatusMensaje.value = '';
    }, 3000);

  } catch (error) {
    estatusMensaje.value = 'Error al guardar.';
    console.error('Error actualizando estatus:', error);
  }
}

// Función para calcular los días en el corralón
function calcularDiasCorralon(fechaIngreso) {
  if (!fechaIngreso) return 'Fecha desconocida';
  
  const fechaInicio = new Date(fechaIngreso);
  const hoy = new Date();
  
  // Reseteamos las horas para contar solo días calendario
  fechaInicio.setHours(0, 0, 0, 0);
  hoy.setHours(0, 0, 0, 0);
  
  const diferenciaMilisegundos = hoy.getTime() - fechaInicio.getTime();
  const dias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
  
  if (dias === 0) return 'Ingresó hoy';
  if (dias === 1) return '1 día';
  return `${dias} días`;
}


function getImageUrl(rutaOriginal) {
  if (!rutaOriginal) return '';
  const rutaCorregida = rutaOriginal.replace(/\\/g, '/');
  return `${API_BASE_URL}/${rutaCorregida}`;
}
</script>

<template>
  <div v-if="vehiculo" class="vista-detalles-admin">
    
    <div class="acciones-top">
      <button @click="regresar" class="btn-regresar">
        &larr; Volver al Inventario
      </button>

      <div class="botones-derecha">
        <button v-if="puedeEditar" @click="mostrarEditor = !mostrarEditor" class="btn-editar">
          ✏️ {{ mostrarEditor ? 'Cerrar Edición' : 'Editar Vehículo' }}
        </button>

        <button 
          v-if="mostrarBotonCita" 
          @click="mostrarModalCita = true" 
          class="btn-cita"
        >
          📅 Agendar Cita
        </button>
      </div>
    </div>

    <div class="tarjeta-info-maestra">
      
      <div class="header-tarjeta">
        <div class="titulo-grupo">
          <h1>{{ vehiculo.marca }} {{ vehiculo.modelo }}</h1>
          <span class="placa-badge">{{ vehiculo.placa }}</span>
        </div>
        
        <div class="tiempo-corralon-badge" :class="{ 'alerta-roja': calcularDiasCorralon(vehiculo.fecha_ingreso).includes('días') && parseInt(calcularDiasCorralon(vehiculo.fecha_ingreso)) > 30 }">
          <span class="icono-reloj">⏳</span>
          <div class="tiempo-info">
            <span class="tiempo-label">Tiempo en patio:</span>
            <span class="tiempo-valor">{{ calcularDiasCorralon(vehiculo.fecha_ingreso) }}</span>
          </div>
        </div>
      </div>

      <div v-if="puedeEditar" class="panel-control-estatus">
        <div class="info-estatus">
          <h3>Control de Estatus</h3>
          <p>Selecciona el destino operativo de este vehículo.</p>
        </div>
        <div class="accion-estatus">
          <select 
            v-model="vehiculo.estatus" 
            @change="actualizarEstatus"
            class="estatus-select"
          >
            <option 
              v-for="opcion in estatusOpciones" 
              :key="opcion" 
              :value="opcion"
            >
              {{ opcion }}
            </option>
          </select>
          <span v-if="estatusMensaje" class="estatus-feedback">{{ estatusMensaje }}</span>
        </div>
      </div>

      <div class="seccion-galeria">
        <h3>Evidencia Fotográfica</h3>
        <div v-if="vehiculo.fotos && vehiculo.fotos.length > 0" class="galeria-fotos">
          <div 
            v-for="(foto, index) in vehiculo.fotos" 
            :key="index" 
            class="foto-wrapper"
            @click="openModal(getImageUrl(foto))"
          >
            <img :src="getImageUrl(foto)" alt="Foto del vehículo">
            <div class="capa-zoom">🔍 Ampliar</div>
          </div>
        </div>
        <p v-else class="texto-vacio">Este vehículo no cuenta con evidencia fotográfica.</p>
      </div>

      <div class="seccion-ficha-tecnica">
        <h3>Ficha Técnica</h3>
        <div class="grid-detalles">
          <div class="detalle-item">
            <span class="label">Año de Fabricación</span>
            <span class="valor">{{ vehiculo.anio }}</span>
          </div>
          <div class="detalle-item">
            <span class="label">Color Exterior</span>
            <span class="valor">{{ vehiculo.color }}</span>
          </div>
          <div class="detalle-item">
            <span class="label">Tipo de Documento</span>
            <span class="valor">{{ vehiculo.titulo }}</span>
          </div>
          
          <div class="detalle-item">
            <span class="label">Costo de Multa</span>
            <span class="valor multa-destacada">
              {{ vehiculo.deuda_inicial ? `$${vehiculo.deuda_inicial.toLocaleString('es-MX')} MXN` : 'Por calcular' }}
            </span>
          </div>
          <div class="detalle-item motivo-box">
            <span class="label">Motivos de Ingreso Registrados</span>
            <span class="valor-texto">{{ vehiculo.motivo }}</span>
          </div>
        </div>
      </div>

    </div> 
    
    <transition name="fade">
      <div v-if="mostrarEditor && puedeEditar" class="contenedor-edicion">
        <EditarVehiculo :idVehiculo="vehiculoId" />
      </div>
    </transition>
    

  </div>

  <div v-else class="pantalla-carga">
    <div class="loader"></div>
    <p>Cargando expediente del vehículo...</p>
  </div>

  <div v-if="isModalVisible" class="image-modal-overlay" @click="closeModal">
    <img :src="selectedImageUrl" alt="Vista ampliada" class="image-modal-content" @click.stop>
    <button class="btn-cerrar-lightbox" @click="closeModal">✖ Cerrar</button>
  </div>

  <div v-if="mostrarModalCita" class="modal-overlay">
    <div class="modal-form-card">
      <h2>Agendar Cita para Ver Auto</h2>
      <p>Por favor llene sus datos para contactarlo.</p>
      
      <form @submit.prevent="agendarCita">
        <div class="campo">
          <label>Nombre Completo:</label>
          <input type="text" v-model="datosCita.nombre" required placeholder="Ej. Juan Pérez">
        </div>
        <div class="campo">
          <label>RFC:</label>
          <input type="text" v-model="datosCita.rfc" required placeholder="RFC con homoclave">
        </div>
        <div class="campo">
          <label>No. de Licencia:</label>
          <input type="text" v-model="datosCita.licencia" required placeholder="Número de licencia vigente">
        </div>
        <div class="campo">
          <label>Correo Electrónico:</label>
          <input type="email" v-model="datosCita.correo" required placeholder="juan@ejemplo.com">
        </div>
        <div class="form-actions">
          <button type="button" @click="mostrarModalCita = false" class="btn-cancelar">Cancelar</button>
          <button type="submit" class="btn-confirmar">Confirmar Cita</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&display=swap');

* {
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
}

.vista-detalles-admin {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* --- BARRA SUPERIOR DE ACCIONES --- */
.acciones-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.botones-derecha { display: flex; gap: 1rem; }
.btn-regresar { background: transparent; color: #94a3b8; border: 1px solid #475569; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
.btn-regresar:hover { background: #334155; color: white; }
.btn-editar { background: linear-gradient(to right, #3b82f6, #2563eb); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3); }
.btn-editar:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4); }
.btn-cita { background: linear-gradient(to right, #10b981, #059669); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s; }

/* --- TARJETA PRINCIPAL --- */
.tarjeta-info-maestra {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px rgba(0,0,0,0.4);
}

.header-tarjeta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed #334155;
}
.titulo-grupo { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;}
.header-tarjeta h1 { margin: 0; color: #f8fafc; font-size: 2.2rem; font-weight: 900; letter-spacing: -0.5px;}
.placa-badge { background: #f59e0b; color: #000; padding: 0.4rem 1rem; border-radius: 4px; font-weight: 800; font-size: 1.2rem; font-family: 'Courier New', monospace;}

/* --- CONTADOR DE DÍAS ESTILO TELEMETRÍA --- */
.tiempo-corralon-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid #3b82f6; 
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}
.tiempo-corralon-badge.alerta-roja { border-left-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
.icono-reloj { font-size: 1.5rem; }
.tiempo-info { display: flex; flex-direction: column; }
.tiempo-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
.tiempo-valor { font-size: 1.1rem; color: #f8fafc; font-weight: 700; }

/* --- PANEL DE ESTATUS --- */
.panel-control-estatus { display: flex; justify-content: space-between; align-items: center; background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 1.5rem; border-radius: 8px; margin-bottom: 2.5rem; }
.info-estatus h3 { margin: 0 0 0.2rem 0; color: #f8fafc; font-size: 1.1rem; }
.info-estatus p { margin: 0; color: #94a3b8; font-size: 0.9rem; }
.accion-estatus { display: flex; flex-direction: column; align-items: flex-end; width: 40%;}
.estatus-select { width: 100%; padding: 0.8rem; border-radius: 6px; border: 1px solid #475569; background: #334155; color: white; font-weight: 600; cursor: pointer; outline: none;}
.estatus-select:focus { border-color: #3b82f6; }
.estatus-feedback { color: #10b981; font-size: 0.85rem; font-weight: 600; margin-top: 0.5rem; }

/* --- GALERÍA --- */
.seccion-galeria { margin-bottom: 2.5rem; }
.seccion-galeria h3 { color: #cbd5e1; font-size: 1.1rem; margin-bottom: 1rem; }
.galeria-fotos { display: flex; flex-wrap: wrap; gap: 1rem; }
.foto-wrapper { position: relative; width: 160px; height: 120px; border-radius: 8px; overflow: hidden; border: 1px solid #334155; cursor: pointer; }
.foto-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.capa-zoom { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; color: white; font-weight: 600; opacity: 0; transition: opacity 0.3s; }
.foto-wrapper:hover img { transform: scale(1.05); }
.foto-wrapper:hover .capa-zoom { opacity: 1; }
.texto-vacio { color: #64748b; font-style: italic; }

/* --- FICHA TÉCNICA --- */
.seccion-ficha-tecnica h3 { color: #cbd5e1; font-size: 1.1rem; margin-bottom: 1rem; }
.grid-detalles { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 8px; border: 1px solid #334155; }
.detalle-item { display: flex; flex-direction: column; }
.motivo-box { grid-column: span 3; border-top: 1px dashed #475569; padding-top: 1rem; margin-top: 0.5rem;}
.label { font-size: 0.85rem; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 0.3rem;}
.valor { font-size: 1.1rem; color: #f8fafc; font-weight: 500; }
.valor-texto { font-size: 1rem; color: #e2e8f0; line-height: 1.5; }
.multa-destacada {
  color: #ef4444; /* Un rojo llamativo */
  font-weight: 800;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  margin-top: 0.2rem;
}

/* --- ESTILOS DE CARGA --- */
.pantalla-carga { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 50vh; color: #94a3b8; }
.loader { border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 1rem;}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* --- LIGHTBOX Y MODALES --- */
.image-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(15,23,42,0.95); display: flex; justify-content: center; align-items: center; z-index: 3000; cursor: zoom-out;}
.image-modal-content { max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 8px; cursor: default;}
.btn-cerrar-lightbox { position: absolute; top: 20px; right: 30px; background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer;}
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.modal-form-card { background: white; padding: 2.5rem; border-radius: 12px; width: 100%; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.modal-form-card h2 { margin-top: 0; color: #1e293b; font-weight: 700;}
.modal-form-card p { color: #64748b; margin-bottom: 1.5rem; }
.campo { margin-bottom: 1rem; }
.campo label { display: block; margin-bottom: 0.4rem; color: #334155; font-weight: 600; font-size: 0.9rem;}
.modal-form-card input { width: 100%; padding: 0.8rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-family: 'Montserrat'; transition: border 0.3s;}
.modal-form-card input:focus { border-color: #3b82f6; outline: none; }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 2rem; }
.btn-cancelar { background-color: #f1f5f9; color: #475569; border: none; padding: 0.8rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: background 0.2s;}
.btn-cancelar:hover { background-color: #e2e8f0; }
.btn-confirmar { background: linear-gradient(to right, #10b981, #059669); color: white; border: none; padding: 0.8rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: transform 0.2s;}
.btn-confirmar:hover { transform: translateY(-2px); }

/* --- TRANSICIONES --- */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }

@media (max-width: 768px) {
  .header-tarjeta { flex-direction: column; align-items: flex-start; gap: 1rem;}
  .panel-control-estatus { flex-direction: column; align-items: flex-start; gap: 1rem;}
  .accion-estatus { width: 100%; align-items: flex-start;}
  .grid-detalles { grid-template-columns: 1fr; }
  .motivo-box { grid-column: span 1; }
}
</style>