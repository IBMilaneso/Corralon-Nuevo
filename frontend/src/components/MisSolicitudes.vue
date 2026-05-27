<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';
const solicitudes = ref([]);
const cargando = ref(true);
const errorMensaje = ref('');

// Extraemos el correo guardado en el navegador
const correoUsuario = localStorage.getItem('correoUsuario') || '';

onMounted(async () => {
  if (!correoUsuario) {
    errorMensaje.value = "No se detectó un correo activo. Por favor, cierra sesión e inicia nuevamente.";
    cargando.value = false;
    return;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/api/ciudadano/solicitudes?correo=${correoUsuario}`);
    
    // 🛡️ VALIDACIÓN: Evita el "crash" en blanco si la respuesta no es un arreglo válido
    if (response.data && Array.isArray(response.data)) {
      solicitudes.value = response.data.map(sol => ({
        ...sol,
        fotosArray: JSON.parse(sol.fotos || '[]')
      }));
    } else {
      solicitudes.value = [];
    }
  } catch (error) {
    console.error("Error al cargar mis solicitudes:", error);
    errorMensaje.value = "Hubo un problema al conectar con el servidor.";
  } finally {
    cargando.value = false;
  }
});

function getImageUrl(rutaOriginal) {
  if (!rutaOriginal || rutaOriginal.length === 0) return '';
  const rutaCorregida = rutaOriginal.replace(/\\/g, '/');
  return `${API_BASE_URL}/${rutaCorregida}`;
}
</script>

<template>
  <div class="mis-solicitudes-view">
    <div class="header-banner">
      <h1>📦 Rastreo de Mis Solicitudes</h1>
      <p>Da seguimiento al estado de tus trámites y ofertas de compra en tiempo real.</p>
    </div>

    <div v-if="cargando" class="cargando-estado">
      <div class="spinner"></div>
      <p>Buscando tus registros en el sistema...</p>
    </div>
    
    <div v-else-if="errorMensaje" class="error-estado">
      <h2>⚠️ Nota del Sistema</h2>
      <p>{{ errorMensaje }}</p>
    </div>

    <div v-else-if="solicitudes.length === 0" class="estado-vacio">
      <h2>Sin solicitudes registradas</h2>
      <p>Si acabas de realizar un trámite, asegúrate de haber usado el correo: <strong>{{ correoUsuario }}</strong></p>
    </div>

    <div v-else class="grid-rastreo">
      <div v-for="item in solicitudes" :key="item.id + item.tipo" class="tarjeta-rastreo">
        
        <div class="foto-vehiculo">
          <img 
            v-if="item.fotosArray && item.fotosArray.length > 0" 
            :src="getImageUrl(item.fotosArray[0])" 
            alt="Vehículo"
          >
          <div v-else class="sin-foto">🚗</div>
          <span class="badge-tipo" :class="item.tipo.toLowerCase()">{{ item.tipo }}</span>
        </div>

        <div class="info-vehiculo">
          <h3>{{ item.marca }} {{ item.modelo }}</h3>
          <p><strong>Placa:</strong> {{ item.placa }}</p>
          <p class="fecha-texto">📅 Registrado el: {{ item.fecha }}</p>
        </div>

        <div class="estado-tracker">
          <div class="tracker-badge" :class="item.estatus.toLowerCase()">
            <span v-if="item.estatus === 'Pendiente'">⏳ En Revisión</span>
            <span v-else-if="item.estatus === 'Aprobado'">✅ Pase a Ventanilla</span>
            <span v-else-if="item.estatus === 'Rechazado'">❌ Rechazado</span>
            <span v-else>{{ item.estatus }}</span>
          </div>
          <p class="mensaje-tracker" v-if="item.estatus === 'Aprobado'">
            Tu solicitud fue aprobada. Preséntate en el corralón con tu documentación oficial para concluir el trámite.
          </p>
          <p class="mensaje-tracker" v-else-if="item.estatus === 'Pendiente'">
            Nuestros operadores están validando los datos de la matrícula.
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

.mis-solicitudes-view { padding: 1.5rem; font-family: 'Montserrat', sans-serif; animation: fadeIn 0.4s ease; }
.header-banner { background: linear-gradient(to right, #1e293b, #0f172a); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; box-shadow: 0 10px 20px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); }
.header-banner h1 { margin: 0; font-weight: 700; }
.header-banner p { margin: 0.5rem 0 0; color: #94a3b8; }

.cargando-estado, .estado-vacio, .error-estado { text-align: center; color: white; padding: 4rem; background: #1e293b; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
.error-estado { border-left: 5px solid #f59e0b; }
.estado-vacio h2 { margin-bottom: 0.5rem; color: #f8fafc; }
.estado-vacio p strong { color: #3b82f6; }

.grid-rastreo { display: flex; flex-direction: column; gap: 1.5rem; }
.tarjeta-rastreo { display: flex; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.1); transition: transform 0.3s; border: 1px solid #e2e8f0; }
.tarjeta-rastreo:hover { transform: translateY(-3px); }

.foto-vehiculo { position: relative; width: 250px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; }
.foto-vehiculo img { width: 100%; height: 100%; object-fit: cover; }
.sin-foto { font-size: 4rem; }
.badge-tipo { position: absolute; top: 10px; left: 10px; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 700; color: white; font-size: 0.8rem; text-transform: uppercase; }
.badge-tipo.reclamo { background: #3b82f6; }
.badge-tipo.compra { background: #8b5cf6; }

.info-vehiculo { padding: 1.5rem; flex: 1; border-right: 2px dashed #cbd5e1; }
.info-vehiculo h3 { margin: 0 0 0.5rem 0; color: #0f172a; font-size: 1.4rem; font-weight: 700; }
.info-vehiculo p { margin: 0.3rem 0; color: #475569; }
.fecha-texto { margin-top: 1rem !important; font-size: 0.9rem; color: #64748b !important; font-weight: 600; }

.estado-tracker { padding: 1.5rem; width: 350px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: #f8fafc; }
.tracker-badge { padding: 0.8rem 1.5rem; border-radius: 30px; font-weight: 700; font-size: 1.1rem; width: 100%; }
.tracker-badge.pendiente { background: #fef3c7; color: #d97706; border: 2px solid #fcd34d; }
.tracker-badge.aprobado { background: #d1fae5; color: #059669; border: 2px solid #34d399; }
.tracker-badge.rechazado { background: #fee2e2; color: #dc2626; border: 2px solid #f87171; }
.mensaje-tracker { margin-top: 1rem; font-size: 0.85rem; color: #64748b; line-height: 1.4; }

.spinner { border: 4px solid rgba(255, 255, 255, 0.1); border-top: 4px solid #3b82f6; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 1rem auto; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 900px) {
  .tarjeta-rastreo { flex-direction: column; }
  .foto-vehiculo { width: 100%; height: 200px; }
  .info-vehiculo { border-right: none; border-bottom: 2px dashed #cbd5e1; }
  .estado-tracker { width: 100%; }
}
</style>