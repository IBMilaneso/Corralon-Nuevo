<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Este componente recibe el ID como "prop"
const props = defineProps({
  idVehiculo: {
    type: [String, Number],
    required: true
  }
});

// Usamos ref() en lugar de reactive() porque los datos llegarán asíncronamente
const vehiculo = ref(null);
const mensaje = ref(''); // Para mostrar mensajes de éxito o error
const anioActual = new Date().getFullYear();
const opcionesTitulo = [
  'Factura Original', 'Refacturado con Copia de Origen', 'Pedimento de Importación',
  'Solo Tarjeta de Circulación', 'Sin Documentos', 'Otro'
];

// 1. Cuando el componente se carga, busca los datos del vehículo
onMounted(async () => {
  try {
    const response = await axios.get(`http://localhost:3000/api/vehiculos/${props.idVehiculo}`);
    vehiculo.value = response.data;
  } catch (error) {
    console.error("Error cargando datos para editar:", error);
    mensaje.value = "Error: No se pudieron cargar los datos.";
  }
});

// 2. Función para guardar los cambios
async function guardarCambios() {
  try {
    mensaje.value = 'Guardando...';
    // Usamos PUT para enviar los datos de texto
    const response = await axios.put(`http://localhost:3000/api/vehiculos/${props.idVehiculo}`, vehiculo.value);
    mensaje.value = response.data.message;
  } catch (error) {
    console.error("Error al guardar cambios:", error);
    mensaje.value = "Error al guardar los cambios.";
  }
}
</script>

<template>
  <div v-if="vehiculo" class="formulario-edicion">
    <hr>
    <h2>Editar Datos del Vehículo</h2>
    <p>Ajusta la información y haz clic en "Guardar Cambios". (La edición de fotos vendrá después).</p>

    <form @submit.prevent="guardarCambios">
      <div class="campo">
        <label>Placa:</label>
        <input type="text" v-model="vehiculo.placa">
      </div>
      <div class="campo">
        <label>Marca:</label>
        <input type="text" v-model="vehiculo.marca">
      </div>
      <div class="campo">
        <label>Modelo:</label>
        <input type="text" v-model="vehiculo.modelo">
      </div>
      <div class="campo">
        <label>Año:</label>
        <input type="number" v-model.number="vehiculo.anio" min="1980" :max="anioActual + 1">
      </div>
      <div class="campo">
        <label>Color:</label>
        <input type="text" v-model="vehiculo.color">
      </div>
      <div class="campo">
        <label>Tipo de Título/Documento:</label>
        <select v-model="vehiculo.titulo">
          <option v-for="opcion in opcionesTitulo" :key="opcion" :value="opcion">{{ opcion }}</option>
        </select>
      </div>
      <div class="campo">
        <label>Motivo de Ingreso:</label>
        <textarea rows="3" v-model="vehiculo.motivo"></textarea>
      </div>

      <button type="submit">Guardar Cambios</button>

      <p v-if="mensaje" class="mensaje-feedback">{{ mensaje }}</p>
    </form>
  </div>
</template>

<style scoped>
/* Usamos los mismos estilos del formulario de registro */
.formulario-edicion {
  margin-top: 2rem;
  padding: 2rem;
  background-color: #2c3e50; /* Un fondo ligeramente distinto */
  border-radius: 8px;
}
.formulario-edicion h2 {
  color: #fff;
}
.formulario-edicion p {
  color: #bdc3c7;
}
.campo { margin-bottom: 1rem; }
label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #fff; }
input, textarea, select {
  width: 100%; padding: 0.75rem; border: 1px solid #ccc;
  border-radius: 4px; box-sizing: border-box;
}
button {
  padding: 0.8rem; border: none; border-radius: 4px;
  background-color: #42b983; color: white; font-size: 1rem;
  font-weight: bold; cursor: pointer; transition: background-color 0.3s;
}
button:hover { background-color: #36a374; }
.mensaje-feedback { font-weight: bold; margin-top: 1rem; }
</style>