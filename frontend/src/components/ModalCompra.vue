<script setup>
import { ref } from 'vue';

const props = defineProps({
  mostrar: Boolean,
  vehiculo: Object 
});

const emit = defineEmits(['cerrar', 'enviarCompra']);

const nombre = ref('');
const telefono = ref('');
const correo = ref('');
const mensaje = ref('');

function enviarFormulario() {
  const datosCompra = {
    nombre: nombre.value,
    telefono: telefono.value,
    correo: correo.value,
    mensaje: mensaje.value,
    vehiculoId: props.vehiculo?.id
  };
  
  emit('enviarCompra', datosCompra);
  limpiarFormulario();
}

function limpiarFormulario() {
  nombre.value = '';
  telefono.value = '';
  correo.value = '';
  mensaje.value = '';
}
</script>

<template>
  <div v-if="mostrar" class="modal-overlay" @click.self="emit('cerrar')">
    <div class="modal-content">
      
      <div class="modal-header">
        <h2>Adquirir Vehículo</h2>
        <button class="btn-cerrar" @click="emit('cerrar')">✖</button>
      </div>

      <div class="modal-body">
        <p class="instrucciones">
          Estás iniciando el proceso de compra para el vehículo:
          <strong>{{ vehiculo?.marca }} {{ vehiculo?.modelo }} ({{ vehiculo?.anio }})</strong>.
          Déjanos tus datos y un asesor se pondrá en contacto contigo.
        </p>

        <form @submit.prevent="enviarFormulario" class="formulario-compra">
          <div class="campo">
            <label>Nombre Completo:</label>
            <input type="text" v-model="nombre" placeholder="Ej. Juan Pérez" required>
          </div>

          <div class="campo-doble">
            <div class="campo">
              <label>Teléfono:</label>
              <input type="tel" v-model="telefono" placeholder="10 dígitos" required maxlength="10">
            </div>
            <div class="campo">
              <label>Correo Electrónico:</label>
              <input type="email" v-model="correo" placeholder="correo@ejemplo.com" required>
            </div>
          </div>

          <div class="campo">
            <label>Mensaje o Propuesta (Opcional):</label>
            <textarea v-model="mensaje" rows="3" placeholder="Me interesa agendar una cita para verlo..."></textarea>
          </div>

          <div class="acciones">
            <button type="button" class="btn-secundario" @click="emit('cerrar')">Cancelar</button>
            <button type="submit" class="btn-primario">Enviar Solicitud</button>
          </div>
        </form>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

* { font-family: 'Montserrat', sans-serif; }

.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(15, 23, 42, 0.7);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000; backdrop-filter: blur(4px); 
}

.modal-content {
  background: #ffffff; width: 90%; max-width: 500px;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: deslizarArriba 0.3s ease-out;
}

@keyframes deslizarArriba {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.5rem; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;
}

.modal-header h2 { margin: 0; font-size: 1.25rem; color: #1e293b; font-weight: 600; }
.btn-cerrar { background: none; border: none; font-size: 1.2rem; color: #64748b; cursor: pointer; transition: color 0.2s; }
.btn-cerrar:hover { color: #ef4444; }

.modal-body { padding: 1.5rem; }
.instrucciones { font-size: 0.95rem; color: #475569; line-height: 1.5; margin-bottom: 1.5rem; }

.formulario-compra .campo { margin-bottom: 1.2rem; }
.campo-doble { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.formulario-compra label { display: block; font-size: 0.85rem; font-weight: 500; color: #334155; margin-bottom: 0.5rem; }
.formulario-compra input, .formulario-compra textarea {
  width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px;
  font-size: 1rem; box-sizing: border-box; transition: border-color 0.2s;
}
.formulario-compra input:focus, .formulario-compra textarea:focus { outline: none; border-color: #27ae60; box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1); }
.formulario-compra textarea { resize: vertical; }

.acciones { display: flex; justify-content: flex-end; gap: 12px; margin-top: 1.5rem; }
.btn-secundario, .btn-primario { padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; }
.btn-secundario { background-color: white; border: 1px solid #cbd5e1; color: #475569; }
.btn-secundario:hover { background-color: #f1f5f9; }
.btn-primario { background-color: #27ae60; border: none; color: white; box-shadow: 0 4px 6px -1px rgba(39, 174, 96, 0.2); }
.btn-primario:hover { background-color: #219150; transform: translateY(-1px); }
</style>