<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  mostrar: Boolean,
  vehiculo: Object,
  esInvitado: Boolean
});

// Dejamos un solo emit que incluya todo lo que necesitas
const emit = defineEmits(['cerrar', 'abrirReclamo', 'abrirCompra']);

const API_BASE_URL = 'http://localhost:3000';

const indiceImagenActual = ref(0);
const mostrarLightbox = ref(false);

function cambiarImagen(index) {
  indiceImagenActual.value = index;
}

function abrirLightbox() {
  mostrarLightbox.value = true;
}

function cerrarLightbox() {
  mostrarLightbox.value = false;
}

function cerrarModal() {
  indiceImagenActual.value = 0;
  mostrarLightbox.value = false;
  emit('cerrar');
}
</script>

<template>
  <div v-if="mostrar" class="modal-overlay" @click.self="cerrarModal">
    <div class="modal-card">
      
      <button class="btn-cerrar-modal" @click="cerrarModal">✖</button>

      <div class="modal-grid" v-if="vehiculo">
        
        <div class="seccion-fotos">
          <div class="imagen-principal-container" @click="abrirLightbox">
            <img 
              v-if="vehiculo.fotos && vehiculo.fotos.length > 0" 
              :src="`${API_BASE_URL}/${vehiculo.fotos[indiceImagenActual]}`" 
              alt="Vehículo" 
              class="imagen-principal" 
            />
            <div v-else class="sin-foto">🚗 Sin imágenes</div>
            <div class="capa-zoom" v-if="vehiculo.fotos && vehiculo.fotos.length > 0">
              <span>🔍 Ampliar</span>
            </div>
          </div>

          <div class="miniaturas-container" v-if="vehiculo.fotos && vehiculo.fotos.length > 1">
            <img 
              v-for="(foto, index) in vehiculo.fotos" 
              :key="index"
              :src="`${API_BASE_URL}/${foto}`"
              :class="['miniatura', { 'activa': index === indiceImagenActual }]"
              @click="cambiarImagen(index)"
            />
          </div>
        </div>

        <div class="seccion-info">
          <div class="header-info">
            <h2>{{ vehiculo.marca }} {{ vehiculo.modelo }}</h2>
            <span class="badge-anio">{{ vehiculo.anio }}</span>
          </div>

          <div class="detalles-lista">
            <div class="detalle-item">
              <span class="label">Placa / Matrícula:</span>
              <span class="valor placa">{{ vehiculo.placa }}</span>
            </div>
            <div class="detalle-item">
              <span class="label">Color:</span>
              <span class="valor">{{ vehiculo.color }}</span>
            </div>
            <div class="detalle-item">
              <span class="label">Título:</span>
              <span class="valor">{{ vehiculo.titulo }}</span>
            </div>
          </div>

          <div class="seccion-multa-modal">
            <h3>🚨 Estado Financiero del Vehículo</h3>
            <div class="tarjeta-deuda-interna">
              <div class="fila-deuda">
                <span>Infracciones acumuladas:</span>
                <p class="motivos-texto">{{ vehiculo?.motivo || 'Ninguna especificada' }}</p>
              </div>
              <div class="total-deuda-modal">
                <span>Total a Liquidar:</span>
                <span class="monto-rojo">
                  ${{ vehiculo?.deuda_inicial ? vehiculo.deuda_inicial.toLocaleString('es-MX') : '0' }} MXN
                </span>
              </div>
            </div>
          </div>

          <div class="acciones-container" v-if="esInvitado">
            <hr class="divisor" />
            <p class="texto-ayuda">Opciones disponibles para este vehículo:</p>
            
            <div class="botones-grid">
              <button 
                class="btn-accion btn-dueño" 
                @click="$emit('abrirReclamo', vehiculo)"
              >
                🛡️ Es mi vehículo
              </button>

              <button 
                v-if="vehiculo?.estatus === 'Para vender'"
                class="btn-accion btn-comprar" 
                @click="emit('abrirCompra')"
              >
                🛒 Me interesa comprarlo
              </button>
            </div>
          </div> 
        </div> 
      </div> 
    </div> 
    
    <div v-if="mostrarLightbox" class="lightbox-overlay" @click.self="cerrarLightbox">
      <button class="btn-cerrar-lightbox" @click="cerrarLightbox">✖ Cerrar</button>
      <img 
        :src="`${API_BASE_URL}/${vehiculo.fotos[indiceImagenActual]}`" 
        class="lightbox-imagen" 
      />
    </div>

  </div> 
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
* { font-family: 'Montserrat', sans-serif; }

.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(5px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}

.modal-card {
  background: #1e293b;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.btn-cerrar-modal {
  position: absolute; top: 15px; right: 20px;
  background: rgba(255, 255, 255, 0.1); border: none; border-radius: 50%;
  width: 35px; height: 35px; color: white; font-size: 1.2rem;
  cursor: pointer; z-index: 10; transition: background 0.2s;
}
.btn-cerrar-modal:hover { background: #ef4444; }

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  color: #f8fafc;
  overflow-y: auto;
}

.seccion-fotos {
  background: #0f172a;
  padding: 1.5rem;
  display: flex; flex-direction: column; gap: 1rem;
}

.imagen-principal-container {
  position: relative; width: 100%; aspect-ratio: 4/3;
  border-radius: 12px; overflow: hidden; cursor: zoom-in;
  background: #000; display: flex; align-items: center; justify-content: center;
}

.imagen-principal {
  width: 100%; height: 100%; object-fit: contain; transition: transform 0.3s;
}

.imagen-principal-container:hover .imagen-principal { transform: scale(1.02); }

.capa-zoom {
  position: absolute; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.3s;
}
.imagen-principal-container:hover .capa-zoom { opacity: 1; }
.capa-zoom span { background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; color: white; }

.miniaturas-container {
  display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px;
}
.miniaturas-container::-webkit-scrollbar { height: 6px; }
.miniaturas-container::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }

.miniatura {
  width: 80px; height: 60px; object-fit: cover; border-radius: 8px;
  cursor: pointer; opacity: 0.5; border: 2px solid transparent; transition: all 0.2s;
}
.miniatura:hover { opacity: 0.8; }
.miniatura.activa { opacity: 1; border-color: #3b82f6; }

.seccion-info {
  padding: 2.5rem 2rem;
  display: flex; flex-direction: column;
}

.header-info {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;
}
.header-info h2 { margin: 0; font-size: 1.8rem; font-weight: 700; color: #ffffff; line-height: 1.2; }
.badge-anio { background: #3b82f6; padding: 0.4rem 1rem; border-radius: 20px; font-weight: 600; }

.detalles-lista {
  display: flex; flex-direction: column; gap: 1.2rem; margin-bottom: 1rem;
}
.detalle-item { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;}
.label { font-size: 0.85rem; color: #94a3b8; text-transform: uppercase; }
.valor { font-size: 1.05rem; font-weight: 500; }
.placa { background: #f1c40f; color: #000; padding: 0.2rem 0.6rem; border-radius: 6px; font-weight: 700; }

/* 👇 ESTILOS DE LA SECCIÓN DE MULTA ADAPTADOS AL DARK MODE 👇 */
.seccion-multa-modal {
  margin-bottom: 2rem;
}

.seccion-multa-modal h3 {
  font-size: 1.05rem;
  color: #f8fafc;
  margin-bottom: 0.8rem;
  font-weight: 600;
}

.tarjeta-deuda-interna {
  background-color: rgba(220, 38, 38, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-left: 4px solid #ef4444;
  border-radius: 8px;
  padding: 1.2rem;
}

.fila-deuda {
  margin-bottom: 1rem;
}

.fila-deuda span {
  font-size: 0.85rem;
  color: #94a3b8;
  display: block;
  margin-bottom: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.motivos-texto {
  font-size: 0.95rem;
  color: #e2e8f0;
  margin: 0;
  font-weight: 500;
  line-height: 1.5;
}

.total-deuda-modal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed rgba(239, 68, 68, 0.3);
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.total-deuda-modal span {
  font-weight: 600;
  color: #f8fafc;
  font-size: 1rem;
}

.monto-rojo {
  font-size: 1.4rem !important;
  font-weight: 900 !important;
  color: #ef4444 !important;
  font-family: 'Courier New', Courier, monospace;
}

.acciones-container { margin-top: auto; }
.divisor { border: 0; height: 1px; background: rgba(255, 255, 255, 0.1); margin-bottom: 1rem; }
.texto-ayuda { color: #94a3b8; font-size: 0.9rem; margin-bottom: 1rem; text-align: center; }

.botones-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.btn-accion { padding: 1rem; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: transform 0.2s; color: white;}
.btn-accion:hover { transform: translateY(-2px); }

.btn-dueño { background: #3b82f6; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); }
.btn-dueño:hover { background: #2563eb; }
.btn-comprar { background: #27ae60; box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3); }
.btn-comprar:hover { background: #219150; }

.lightbox-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.95);
  display: flex; justify-content: center; align-items: center; z-index: 2000;
}
.btn-cerrar-lightbox {
  position: absolute; top: 20px; right: 30px; background: none; border: none;
  color: white; font-size: 1.2rem; cursor: pointer; z-index: 2010;
}
.lightbox-imagen {
  max-width: 90%; max-height: 90vh; object-fit: contain;
}

@media (max-width: 768px) {
  .modal-grid { grid-template-columns: 1fr; }
  .seccion-fotos { padding: 1rem; }
  .seccion-info { padding: 1.5rem; }
  .botones-grid { grid-template-columns: 1fr; }
}
</style>