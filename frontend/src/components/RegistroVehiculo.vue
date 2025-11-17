// RegistroVehiculo.vue

<script setup>
import { reactive, ref } from 'vue';
import axios from 'axios'; // <-- IMPORTA AXIOS

const anioActual = new Date().getFullYear();
const opcionesTitulo = [
  'Factura Original',
  'Refacturado con Copia de Origen',
  'Pedimento de Importación',
  'Solo Tarjeta de Circulación',
  'Sin Documentos',
  'Otro'
];

// ---> LA LÍNEA DEL ERROR ESTÁ AQUÍ <---
// Asegúrate de que esta declaración exista y esté bien escrita.
const vehiculo = reactive({
  placa: '',
  marca: '',
  modelo: '',
  anio: null,
  titulo: '',
  color: '',
  motivo: ''
});

const fotos = ref([]);
const fotoPrincipalPreview = ref(null);

function handleFileUpload(event) {
  const archivosNuevos = event.target.files;
  if (!archivosNuevos.length) return;

  const limiteFotos = 20;
  const espacioDisponible = limiteFotos - fotos.value.length;

  if (espacioDisponible <= 0) {
    alert('Ya has alcanzado el límite de 20 fotos.');
    event.target.value = ''; // Limpia el input
    return;
  }

  let archivosParaAgregar = Array.from(archivosNuevos);

  // Si la nueva selección excede el espacio, recorta la selección
  if (archivosNuevos.length > espacioDisponible) {
    alert(`Solo puedes agregar ${espacioDisponible} fotos más. Se agregarán las primeras ${espacioDisponible} de tu selección.`);
    archivosParaAgregar = archivosParaAgregar.slice(0, espacioDisponible);
  }

  // Mapea los archivos al formato { file, url }
  const nuevosObjetosFoto = archivosParaAgregar.map(file => {
    return {
      file: file,
      url: URL.createObjectURL(file)
    };
  });

  // AÑADE las nuevas fotos al array existente
  fotos.value.push(...nuevosObjetosFoto);
  
  // Limpia el input para permitir seleccionar más archivos
  event.target.value = '';
}

function eliminarFoto(index){
  fotos.value.splice(index, 1);
}

async function registrar() {
  // 1. Crear un objeto FormData para empaquetar los datos y las fotos
  const formData = new FormData();

  // 2. Añadir todos los datos de texto del vehículo
  for (const key in vehiculo) {
    formData.append(key, vehiculo[key]);
  }

  // 3. Añadir todos los archivos de las fotos
  for (const fotoObj of fotos.value) {
  formData.append('fotos', fotoObj.file); 
  }

  // 4. Enviar los datos al servidor usando Axios
  try {
    const response = await axios.post('http://localhost:3000/api/registrar-vehiculo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Si todo salió bien, el servidor nos responderá
    console.log('Respuesta del servidor:', response.data);
    alert('¡Vehículo registrado con éxito!');
    // Aquí podrías limpiar el formulario o redirigir al usuario

  } catch (error) {
    console.error('Error al registrar el vehículo:', error);
    alert('Hubo un error al registrar el vehículo.');
  }
}
</script>

<template>
  <div class="formulario-container">
    <h2>Otro para la colección: Registra el Vehículo</h2>
    
    <form @submit.prevent="registrar">
      <div class="campo">
        <label for="placa">Placa:</label>
        <input type="text" id="placa" placeholder="La placa del infractor" v-model="vehiculo.placa">
      </div>

      <div class="campo">
        <label for="marca">Marca:</label>
        <input type="text" id="marca" placeholder="¿Qué auto abandonaron ahora?" v-model="vehiculo.marca">
      </div>
      
      <div class="campo">
        <label for="modelo">Modelo:</label>
        <input type="text" id="modelo" placeholder="Ej. Versa" v-model="vehiculo.modelo">
      </div>

      <div class="campo">
        <label for="anio">Año:</label>
        <input 
          type="number" 
          id="anio" 
          placeholder="Ej. 2015" 
          v-model.number="vehiculo.anio"
          min="1980"
          :max="anioActual + 1"
        >
      </div>

      <div class="campo">
        <label for="titulo">Tipo de Título/Documento:</label>
        <select id="titulo" v-model="vehiculo.titulo">
          <option disabled value="">-- Selecciona una opción --</option>
          <option v-for="opcion in opcionesTitulo" :key="opcion" :value="opcion">
            {{ opcion }}
          </option>
        </select>
      </div>

      <div class="campo">
        <label for="color">Color:</label>
        <input type="text" id="color" placeholder="Ej. Rojo" v-model="vehiculo.color">
      </div>
      
      <div class="campo">
        <label for="motivo">Motivo de Ingreso:</label>
        <textarea id="motivo" rows="3" placeholder="Ej. Estacionado en lugar prohibido" v-model="vehiculo.motivo"></textarea>
      </div>

      <div class="campo">
        <label>Fotografías del Vehículo (la primera será la principal)</label>
        
        <label for="file-upload" class="input-file-trigger">
          Seleccionar Archivos...
        </label>
        
        <input 
          type="file" 
          id="file-upload"
          class="input-file-hidden"
          multiple 
          accept="image/*"
          @change="handleFileUpload"
        >
        
        <div v-if="fotos.length > 0" class="foto-preview-gallery">
          <div 
            v-for="(foto, index) in fotos" 
            :key="foto.url" 
            class="foto-preview-card"
          >
            <img :src="foto.url" alt="Vista previa">

            <button 
              type="button" 
              @click.stop="eliminarFoto(index)" 
              class="btn-eliminar-foto"
            >
              &times; </button>
          </div>
      </div>
      </div>

      <button type="submit">¡Registrar y Multar!</button>
    </form>
  </div>

  
</template>

<style scoped>
.formulario-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  border: 2px solid #ffffffff; /* Borde de advertencia amarillo */
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background-color: #222627; /* Fondo amarillo pálido */
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #ffffffff; /* Color oscuro para el título */
  font-family: 'Courier New', Courier, monospace; /* Una fuente más ruda */
}

.campo {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #ffffffff;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: #fff;
  transition: border-color 0.3s, box-shadow 0.3s;
}

/* Cuando el usuario hace clic en un campo, el borde se pone rojo */
input:focus, textarea:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.25);
  outline: none;
}

button {
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  background-color: #01655c; /* Botón de "peligro" rojo */
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  text-transform: uppercase;
}

button:hover {
  background-color: #c82333; /* Un rojo más oscuro al pasar el mouse */
}

/* --- Estilos para la subida de archivos --- */
.input-file-hidden {
  display: none; /* Oculta el input de archivo por defecto */
}

.input-file-trigger {
  display: block;
  width: 96%;
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  background-color: #01655c;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  text-transform: uppercase;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.input-file-trigger:hover {
  border-color: #42b983;
  background-color: #42b983;
}

.foto-preview {
  margin-top: 1rem;
  text-align: center;
}

.foto-preview img {
  max-width: 100%;
  max-height: 250px;
  border-radius: 8px;
  border: 2px solid #ddd;
}

.foto-preview-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.foto-preview-card {
  position: relative; /* Clave para el botón 'X' */
  width: 120px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.foto-preview-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* --- Estilos para el botón 'X' --- */
.btn-eliminar-foto {
  position: absolute; /* Se posiciona sobre la tarjeta */
  top: 4px;
  right: 4px;
  
  /* Hacemos el botón pequeño y redondo */
  width: 24px;
  height: 24px;
  border-radius: 50%;
  
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  
  /* Centramos la 'X' */
  display: flex;
  justify-content: center;
  align-items: center;
  
  font-size: 1.2rem;
  line-height: 1;
  padding: 0;
  padding-bottom: 2px; /* Ajuste visual */
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-eliminar-foto:hover {
  background-color: #dc3545; /* Rojo al pasar el mouse */
}

</style>