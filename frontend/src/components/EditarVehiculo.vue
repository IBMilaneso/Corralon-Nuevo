<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const props = defineProps({
  idVehiculo: {
    type: [String, Number],
    required: true
  }
});

const API_BASE_URL = 'http://localhost:3000';
const vehiculo = ref(null);
const fotosNuevas = ref([]);
const mensaje = ref('');
const anioActual = new Date().getFullYear();
const opcionesTitulo = [
  'Factura Original', 'Refacturado con Copia de Origen', 'Pedimento de Importación',
  'Solo Tarjeta de Circulación', 'Sin Documentos', 'Otro'
];

// --- 🚔 CATÁLOGO DE MULTAS (EL MISMO DEL REGISTRO) ---
const costoArrastreGrua = 850; 
const catalogoInfracciones = [
  { id: 1, nombre: 'Vehículo abandonado en vía pública', costo: 1200 },
  { id: 2, nombre: 'Estacionarse en lugar prohibido / Doble fila', costo: 1500 },
  { id: 3, nombre: 'Falta de documentos (Licencia/Tarjeta)', costo: 1800 },
  { id: 4, nombre: 'Exceso de velocidad', costo: 2200 },
  { id: 5, nombre: 'Participación en accidente vial (Choque)', costo: 2500 },
  { id: 6, nombre: 'Intento de fuga o evadir a la autoridad', costo: 4500 },
  { id: 7, nombre: 'Conducir en estado de ebriedad (Alcoholímetro)', costo: 10500 }
];

const multasSeleccionadas = ref([]);

// --- 🧮 CALCULADORA EN TIEMPO REAL ---
const totalMulta = computed(() => {
  let total = costoArrastreGrua; 
  multasSeleccionadas.value.forEach(multa => {
    total += multa.costo;
  });
  return total;
});

onMounted(async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/vehiculos/${props.idVehiculo}`);
    vehiculo.value = response.data;

    // 🧠 INGENIERÍA INVERSA: Leer el texto viejo y marcar los checkboxes
    if (vehiculo.value.motivo) {
      // Separamos la cadena por comas y le quitamos los espacios extra
      const motivosGuardados = vehiculo.value.motivo.split(',').map(m => m.trim());
      
      // Filtramos el catálogo buscando coincidencias exactas
      multasSeleccionadas.value = catalogoInfracciones.filter(infraccion => 
        motivosGuardados.includes(infraccion.nombre)
      );
    }

  } catch (error) {
    console.error("Error cargando datos para editar:", error);
  }
});

async function guardarCambios() {
  try {
    mensaje.value = 'Guardando...';

    // 1. Actualizamos el texto de motivo basado en los checkboxes actuales
    if (multasSeleccionadas.value.length > 0) {
      vehiculo.value.motivo = multasSeleccionadas.value.map(m => m.nombre).join(', ');
    } else {
      vehiculo.value.motivo = 'Ingreso sin multas especificadas';
    }

    const formData = new FormData();
    formData.append('placa', vehiculo.value.placa);
    formData.append('marca', vehiculo.value.marca);
    formData.append('modelo', vehiculo.value.modelo);
    formData.append('anio', vehiculo.value.anio);
    formData.append('color', vehiculo.value.color);
    formData.append('titulo', vehiculo.value.titulo);
    formData.append('motivo', vehiculo.value.motivo);
    
    // 👇 ¡ENVIAMOS EL NUEVO CÁLCULO DE LA DEUDA A SQL SERVER! 👇
    formData.append('deuda_inicial', totalMulta.value);

    formData.append('fotosActualesJson', JSON.stringify(vehiculo.value.fotos));

    for (const fotoObj of fotosNuevas.value) {
      formData.append('fotosNuevas', fotoObj.file);
    }

    // Ojo: Si tu backend (server.js) en el PUT no está recibiendo deuda_inicial
    // necesitamos asegurarnos de que la ruta app.put() la actualice.
    const response = await axios.put(`${API_BASE_URL}/api/vehiculos/${props.idVehiculo}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    mensaje.value = '¡Cambios y multas actualizados con éxito!';
    fotosNuevas.value = [];
    
    // Refrescamos los datos
    setTimeout(() => {
      mensaje.value = '';
    }, 3000);

  } catch (error) {
    console.error("Error al guardar cambios:", error);
    mensaje.value = "Error al guardar los cambios.";
  }
}

function eliminarFotoExistente(index) {
  vehiculo.value.fotos.splice(index, 1);
}

function handleFileUpload(event) {
  const archivosNuevos = event.target.files;
  if (!archivosNuevos.length) return;

  const limiteFotos = 20 - (vehiculo.value.fotos.length + fotosNuevas.value.length);
  if (limiteFotos <= 0) {
    alert('Ya has alcanzado el límite de 20 fotos.');
    return;
  }

  let archivosParaAgregar = Array.from(archivosNuevos).slice(0, limiteFotos);

  const nuevosObjetosFoto = archivosParaAgregar.map(file => ({
    file: file,
    url: URL.createObjectURL(file)
  }));

  fotosNuevas.value.push(...nuevosObjetosFoto);
  event.target.value = '';
}

function eliminarFotoNueva(index) {
  fotosNuevas.value.splice(index, 1);
}

function getImageUrl(rutaOriginal) {
  if (!rutaOriginal) return '';
  const rutaCorregida = rutaOriginal.replace(/\\/g, '/');
  return `${API_BASE_URL}/${rutaCorregida}`;
}
</script>

<template>
  <div v-if="vehiculo" class="formulario-edicion">
    <hr class="separador-top">
    <h2>Editar Vehículo</h2>
    <p class="subtitulo">Ajusta la información, añade o quita multas y haz clic en "Guardar Cambios".</p>

    <form @submit.prevent="guardarCambios">
      
      <div class="grid-2-col">
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
      </div>

      <div class="grid-2-col">
        <div class="campo">
          <label>Color:</label>
          <input type="text" v-model="vehiculo.color">
        </div>
        <div class="campo">
          <label>Documento:</label>
          <select v-model="vehiculo.titulo" class="estilo-input">
            <option disabled value="">-- Selecciona una opción --</option>
            <option v-for="opcion in opcionesTitulo" :key="opcion" :value="opcion">{{ opcion }}</option>
          </select>
        </div>
      </div>

      <hr class="separador">

      <div class="campo-multas">
        <label class="titulo-seccion">Actualizar Infracciones:</label>
        
        <div class="checkbox-grid">
          <label v-for="infraccion in catalogoInfracciones" :key="infraccion.id" class="checkbox-label">
            <input type="checkbox" :value="infraccion" v-model="multasSeleccionadas" class="checkbox-input">
            <span class="checkbox-texto">{{ infraccion.nombre }}</span>
            <span class="checkbox-precio">${{ infraccion.costo.toLocaleString('es-MX') }}</span>
          </label>
        </div>
      </div>

      <div class="ticket-cobro">
        <h3>🧾 Nuevo Desglose de Infracción</h3>
        <ul class="lista-cobro">
          <li>
            <span>Arrastre de Grúa (Base)</span>
            <span>$850</span>
          </li>
          <li v-for="multa in multasSeleccionadas" :key="multa.id">
            <span>{{ multa.nombre }}</span>
            <span>${{ multa.costo.toLocaleString('es-MX') }}</span>
          </li>
        </ul>
        <div class="total-cobro">
          <span>NUEVA DEUDA TOTAL:</span>
          <span>${{ totalMulta.toLocaleString('es-MX') }} MXN</span>
        </div>
      </div>

      <hr class="separador">

      <div class="campo">
        <label>Fotos Actuales (Haz clic en 'X' para eliminar)</label>
        <div class="foto-preview-gallery">
          <div v-for="(foto, index) in vehiculo.fotos" :key="foto" class="foto-preview-card">
            <img :src="getImageUrl(foto)" alt="Foto existente">
            <button type="button" @click.stop="eliminarFotoExistente(index)" class="btn-eliminar-foto">&times;</button>
          </div>
          <p v-if="!vehiculo.fotos || vehiculo.fotos.length === 0" class="texto-vacio">Este vehículo no tiene fotos.</p>
        </div>
      </div>

      <div class="campo">
        <label>Añadir Fotos Nuevas (Límite 20 total)</label>
        <label for="file-upload-edit" class="input-file-trigger-edit">
          Seleccionar archivos...
        </label>
        <input 
          type="file" 
          id="file-upload-edit"
          class="input-file-hidden"
          multiple 
          accept="image/*" 
          @change="handleFileUpload"
        >
        
        <div v-if="fotosNuevas.length > 0" class="foto-preview-gallery nuevas">
          <div v-for="(foto, index) in fotosNuevas" :key="foto.url" class="foto-preview-card">
            <img :src="foto.url" alt="Vista previa">
            <button type="button" @click.stop="eliminarFotoNueva(index)" class="btn-eliminar-foto">&times;</button>
          </div>
        </div>
      </div>
      
      <button type="submit" class="btn-guardar">Guardar Cambios y Actualizar Multa</button>
      
      <div v-if="mensaje" class="mensaje-alerta">
        {{ mensaje }}
      </div>
    </form>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

* {
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
}

.formulario-edicion {
  margin-top: 1.5rem;
  padding: 2.5rem;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
}

.separador-top {
  border: 0; height: 2px; background: #3b82f6; margin-bottom: 2rem; width: 60px;
}

.formulario-edicion h2 {
  color: #f8fafc;
  margin-top: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.subtitulo {
  color: #94a3b8;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 0.5rem; }
.campo { margin-bottom: 1rem; }
label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #cbd5e1; font-size: 0.95rem; }

input, textarea, .estilo-input {
  width: 100%; padding: 0.8rem; border: 1px solid #475569; border-radius: 6px;
  background-color: #334155; color: white; font-size: 1rem; transition: all 0.3s;
}
input:focus, .estilo-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); outline: none; }

.separador { border: 0; height: 1px; background: #334155; margin: 2rem 0; }

/* --- CHECKBOXES (MULTAS) --- */
.titulo-seccion { font-size: 1.1rem; color: #f8fafc; margin-bottom: 1rem; border-left: 4px solid #ef4444; padding-left: 8px; }
.checkbox-grid { display: grid; grid-template-columns: 1fr; gap: 0.8rem; }
.checkbox-label {
  display: flex; align-items: center; background-color: #1e293b; padding: 0.8rem 1rem;
  border: 1px solid #334155; border-radius: 8px; cursor: pointer; transition: all 0.2s;
}
.checkbox-label:hover { background-color: #334155; border-color: #ef4444; }
.checkbox-input { width: 20px; height: 20px; margin-right: 12px; accent-color: #ef4444; cursor: pointer; }
.checkbox-texto { flex-grow: 1; color: #e2e8f0; font-size: 0.95rem; }
.checkbox-precio { font-weight: bold; color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 4px 8px; border-radius: 4px; font-size: 0.9rem; }

/* --- TICKET DE COBRO --- */
.ticket-cobro {
  background-color: #f8fafc; color: #0f172a; padding: 1.5rem; border-radius: 8px; margin-top: 1.5rem;
  border-left: 6px solid #10b981; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.ticket-cobro h3 { margin: 0 0 1rem 0; font-size: 1.2rem; border-bottom: 2px dashed #cbd5e1; padding-bottom: 0.5rem; color: #334155; font-weight: 700;}
.lista-cobro { list-style: none; padding: 0; margin: 0 0 1rem 0; }
.lista-cobro li { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem; color: #475569; font-weight: 500;}
.total-cobro { display: flex; justify-content: space-between; font-size: 1.3rem; font-weight: 900; color: #0f172a; border-top: 2px dashed #cbd5e1; padding-top: 1rem; }

/* --- FOTOS --- */
.foto-preview-gallery {
  display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem;
  background: rgba(0, 0, 0, 0.2); padding: 1rem; border-radius: 6px; border: 1px dashed #475569;
}
.foto-preview-gallery.nuevas { border-color: #10b981; background: rgba(16, 185, 129, 0.05); }
.foto-preview-card {
  position: relative; width: 120px; height: 90px; border-radius: 8px; overflow: hidden; border: 2px solid #334155;
}
.foto-preview-card img { width: 100%; height: 100%; object-fit: cover; }
.texto-vacio { color: #64748b; font-size: 0.9rem; font-style: italic; margin: 0; }

.btn-eliminar-foto {
  position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; border-radius: 50%;
  background-color: rgba(239, 68, 68, 0.9); color: white; border: none;
  display: flex; justify-content: center; align-items: center; font-size: 1.2rem; cursor: pointer; transition: background-color 0.2s;
}
.btn-eliminar-foto:hover { background-color: #b91c1c; }

.input-file-hidden { display: none; }
.input-file-trigger-edit {
  display: block; width: 100%; padding: 1rem; border: 2px dashed #475569; border-radius: 8px;
  background: rgba(51, 65, 85, 0.5); color: #cbd5e1; font-size: 1rem; font-weight: 600; text-align: center; cursor: pointer; transition: all 0.3s;
}
.input-file-trigger-edit:hover { border-color: #38bdf8; color: #38bdf8; background: rgba(56, 189, 248, 0.05); }

.btn-guardar {
  width: 100%; padding: 1rem; border: none; border-radius: 8px;
  background: linear-gradient(to right, #3b82f6, #2563eb); color: white; font-size: 1.1rem;
  font-weight: bold; cursor: pointer; transition: all 0.3s; text-transform: uppercase; letter-spacing: 1px; margin-top: 1.5rem;
}
.btn-guardar:hover { background: linear-gradient(to right, #2563eb, #1d4ed8); transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4); }

.mensaje-alerta {
  margin-top: 1.5rem; padding: 1rem; background-color: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981;
  color: #10b981; font-weight: 600; border-radius: 4px; text-align: center;
}

@media (max-width: 768px) {
  .grid-2-col { grid-template-columns: 1fr; }
  .formulario-edicion { padding: 1.5rem; }
}
</style>