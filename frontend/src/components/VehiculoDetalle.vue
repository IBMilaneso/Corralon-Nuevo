<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Importamos los hooks del router
import axios from 'axios';
import EditarVehiculo from './EditarVehiculo.vue';

const route = useRoute(); // Contiene información de la URL actual
const puedeEditar = computed(() => route.query.modo === 'editar');
const router = useRouter(); // Nos permite navegar

const vehiculo = ref(null); // Aquí guardaremos los datos del vehículo
const vehiculoId = route.params.id; // Obtenemos el ID de la URL
const mostrarEditor = ref(false);

const isModalVisible = ref(false);
const selectedImageUrl = ref('');

// Esta función se ejecuta cuando el componente se carga
onMounted(async () => {
  try {
    // Pedimos al backend los datos del vehículo con este ID
    const response = await axios.get(`http://localhost:3000/api/vehiculos/${vehiculoId}`);
    vehiculo.value = response.data;
  } catch (error) {
    console.error('Error al cargar los detalles del vehículo:', error);
  }
});

// Función para el botón de "Regresar"
function regresar() {
  router.back(); // Este es el comando mágico
}

function openModal(imageUrl) {
  selectedImageUrl.value = imageUrl;
  isModalVisible.value = true;
}

function closeModal() {
  isModalVisible.value = false;
}

</script>

<template>
  <div v-if="vehiculo" class="detalle-container">
    <button @click="regresar" class="btn-regresar">
      &larr; Regresar
    </button>

    <button v-if="puedeEditar" @click="mostrarEditor = !mostrarEditor" class="btn-editar">
      ✏️ Editar Vehículo
    </button>

    <h1>Detalles de: {{ vehiculo.marca }} {{ vehiculo.modelo }} ({{ vehiculo.placa }})</h1>

    <EditarVehiculo v-if="mostrarEditor && puedeEditar" :idVehiculo="vehiculoId" />

    <div class="galeria-fotos">
      <img 
        v-for="(foto, index) in vehiculo.fotos" 
        :key="index" 
        :src="`http://localhost:3000/${foto}`" 
        alt="Foto del vehículo"
        @click="openModal(`http://localhost:3000/${foto}`)"
      >
    </div>

    <ul class="lista-detalles">
      <li><strong>Año:</strong> {{ vehiculo.anio }}</li>
      <li><strong>Color:</strong> {{ vehiculo.color }}</li>
      <li><strong>Documento:</strong> {{ vehiculo.titulo }}</li>
      <li><strong>Motivo de Ingreso:</strong> {{ vehiculo.motivo }}</li>
    </ul>
  </div>

  <div v-else>
    <p>Cargando detalles del vehículo...</p>
  </div>

  <div 
    v-if="isModalVisible" 
    class="image-modal-overlay" 
    @click="closeModal"
  >
    <img 
      :src="selectedImageUrl" 
      alt="Vista ampliada" 
      class="image-modal-content"
      @click.stop >
  </div>
</template>

<style scoped>
.detalle-container {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}
.btn-regresar {
  background-color: #7f8c8d;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 1.5rem;
  transition: background-color 0.3s;
}
.btn-regresar:hover {
  background-color: #95a5a6;
}
.galeria-fotos {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1.5rem 0;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}
.galeria-fotos img {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
}
.lista-detalles {
  list-style-type: none;
  padding: 0;
}
.lista-detalles li {
  font-size: 1.1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}
.lista-detalles strong {
  color: #34495e;
}

.btn-editar {
  background-color: #01655c; 
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 1.5rem;
  margin-left: 10px; /* Espacio entre botones */
  transition: background-color 0.3s;
}
.btn-editar:hover {
  background-color: #42b983;
}

.galeria-fotos img {
  cursor: pointer; /* Le dice al usuario que la imagen es clickeable */
  transition: transform 0.2s;
}

.galeria-fotos img:hover {
  transform: scale(1.05); /* Un pequeño efecto al pasar el mouse */
}

.image-modal-overlay {
  position: fixed; /* Cubre toda la pantalla */
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  
  background-color: rgba(0, 0, 0, 0.85); /* Fondo negro semi-transparente */
  
  display: flex;
  justify-content: center;
  align-items: center;
  
  z-index: 1000; /* Se asegura de que esté por encima de todo */
  cursor: pointer;
}

.image-modal-content {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain; /* Mantiene la proporción de la imagen */
  border-radius: 8px;
  cursor: default; /* El cursor normal sobre la imagen */
}

</style>