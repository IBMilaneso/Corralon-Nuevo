<script setup>
import { ref } from 'vue';

const props = defineProps({
  mostrar: Boolean,
  vehiculo: Object 
});

const emit = defineEmits(['cerrar', 'enviarReclamo']);

const rfc = ref('');
const licencia = ref('');
const correo = ref('');

function enviarFormulario() {
  const datosReclamo = {
    rfc: rfc.value.toUpperCase(),
    licencia: licencia.value,
    correo: correo.value
  };
  
  emit('enviarReclamo', datosReclamo);
  limpiarFormulario();
}

function limpiarFormulario() {
  rfc.value = '';
  licencia.value = '';
  correo.value = '';
}
</script>

<template>
  <div v-if="mostrar" class="modal-overlay" @click.self="emit('cerrar')">
    <div class="modal-content">
      
      <div class="modal-header">
        <h2>Reclamar Vehículo</h2>
        <button class="btn-cerrar" @click="emit('cerrar')">✖</button>
      </div>

      <div class="modal-body">
        <p class="instrucciones">
          Estás iniciando el trámite de liberación para el vehículo:
          <strong>{{ vehiculo?.marca }} {{ vehiculo?.modelo }} (Placa: {{ vehiculo?.placa }})</strong>.
          Por favor, ingresa tus datos.
        </p>

        <form @submit.prevent="enviarFormulario" class="formulario-reclamo">
          <div class="campo">
            <label>RFC (Con Homoclave):</label>
            <input type="text" v-model="rfc" placeholder="13 caracteres" required maxlength="13">
          </div>

          <div class="campo">
            <label>Número de Licencia:</label>
            <input type="text" v-model="licencia" placeholder="Licencia vigente" required>
          </div>

          <div class="campo">
            <label>Correo Electrónico:</label>
            <input type="email" v-model="correo" placeholder="correo@ejemplo.com" required>
          </div>

          <div class="acciones">
            <button type="button" class="btn-secundario" @click="emit('cerrar')">Cancelar</button>
            <button type="submit" class="btn-primario">Enviar Reclamo</button>
          </div>
        </form>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
* { font-family: 'Montserrat', sans-serif; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(15, 23, 42, 0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px); }
.modal-content { background: #ffffff; width: 90%; max-width: 500px; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); animation: deslizarArriba 0.3s ease-out; }
@keyframes deslizarArriba { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc; }
.modal-header h2 { margin: 0; font-size: 1.25rem; color: #1e293b; font-weight: 600; }
.btn-cerrar { background: none; border: none; font-size: 1.2rem; color: #64748b; cursor: pointer; transition: color 0.2s; }
.btn-cerrar:hover { color: #ef4444; }
.modal-body { padding: 1.5rem; }
.instrucciones { font-size: 0.95rem; color: #475569; line-height: 1.5; margin-bottom: 1.5rem; }
.formulario-reclamo .campo { margin-bottom: 1.2rem; }
.formulario-reclamo label { display: block; font-size: 0.85rem; font-weight: 500; color: #334155; margin-bottom: 0.5rem; }
.formulario-reclamo input { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 1rem; box-sizing: border-box; transition: border-color 0.2s; }
.formulario-reclamo input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.acciones { display: flex; justify-content: flex-end; gap: 12px; margin-top: 1.5rem; }
.btn-secundario, .btn-primario { padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; }
.btn-secundario { background-color: white; border: 1px solid #cbd5e1; color: #475569; }
.btn-secundario:hover { background-color: #f1f5f9; }
.btn-primario { background-color: #3b82f6; border: none; color: white; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2); }
.btn-primario:hover { background-color: #2563eb; transform: translateY(-1px); }
</style>