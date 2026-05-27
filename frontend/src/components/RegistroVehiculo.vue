<script setup>
import { reactive, ref, computed } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';
const anioActual = new Date().getFullYear();
const opcionesTitulo = [
  'Factura Original',
  'Refacturado con Copia de Origen',
  'Pedimento de Importación',
  'Solo Tarjeta de Circulación',
  'Sin Documentos',
  'Otro'
];

// --- 🚔 CATÁLOGO DE MULTAS REALES (MÉXICO) ---
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

// --- 🧮 CALCULADORA EN TIEMPO REAL ---
const totalMulta = computed(() => {
  let total = costoArrastreGrua; 
  multasSeleccionadas.value.forEach(multa => {
    total += multa.costo;
  });
  return total;
});

function handleFileUpload(event) {
  const archivosNuevos = event.target.files;
  if (!archivosNuevos.length) return;

  const limiteFotos = 20;
  const espacioDisponible = limiteFotos - fotos.value.length;

  if (espacioDisponible <= 0) {
    alert('Ya has alcanzado el límite de 20 fotos.');
    event.target.value = '';
    return;
  }

  let archivosParaAgregar = Array.from(archivosNuevos);

  if (archivosNuevos.length > espacioDisponible) {
    alert(`Solo puedes agregar ${espacioDisponible} fotos más.`);
    archivosParaAgregar = archivosParaAgregar.slice(0, espacioDisponible);
  }

  const nuevosObjetosFoto = archivosParaAgregar.map(file => {
    return { file: file, url: URL.createObjectURL(file) };
  });

  fotos.value.push(...nuevosObjetosFoto);
  event.target.value = '';
}

function eliminarFoto(index){
  fotos.value.splice(index, 1);
}

async function registrar() {
  if (multasSeleccionadas.value.length > 0) {
    vehiculo.motivo = multasSeleccionadas.value.map(m => m.nombre).join(', ');
  } else {
    vehiculo.motivo = 'Ingreso sin multas especificadas';
  }

  const formData = new FormData();
  for (const key in vehiculo) {
    formData.append(key, vehiculo[key]);
  }

  formData.append('deuda_inicial', totalMulta.value);

  for (const fotoObj of fotos.value) {
    formData.append('fotos', fotoObj.file);
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/api/registrar-vehiculo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    console.log('Respuesta del servidor:', response.data);
    alert(`¡Vehículo registrado! Deuda inicial generada: $${totalMulta.value} MXN`);
    resetForm();

  } catch (error) {
    console.error('Error al registrar el vehículo:', error);
    alert('Hubo un error al registrar el vehículo.');
  }
}

function resetForm() {
  Object.assign(vehiculo, {
    placa: '', marca: '', modelo: '', anio: null, titulo: '', color: '', motivo: ''
  });
  fotos.value = [];
  multasSeleccionadas.value = []; 
}
</script>

<template>
  <div class="formulario-container"> 
    <button type="button" @click="resetForm" class="btn-reset-lateral" title="Limpiar Formulario">🔄️</button>

    <h2>Otro para la colección: Registra el Vehículo</h2>
    <form @submit.prevent="registrar">
      
      <div class="grid-2-col">
        <div class="campo">
          <label for="placa">Placa:</label>
          <input type="text" id="placa" placeholder="Placa" v-model="vehiculo.placa">
        </div>
        <div class="campo">
          <label for="marca">Marca:</label>
          <input type="text" id="marca" placeholder="Ej. Nissan" v-model="vehiculo.marca">
        </div>
        <div class="campo">
          <label for="modelo">Modelo:</label>
          <input type="text" id="modelo" placeholder="Ej. Versa" v-model="vehiculo.modelo">
        </div>
        <div class="campo">
          <label for="anio">Año:</label>
          <input type="number" id="anio" placeholder="Ej. 2015" v-model.number="vehiculo.anio" min="1980" :max="anioActual + 1">
        </div>
      </div>

      <div class="grid-2-col">
        <div class="campo">
          <label for="color">Color:</label>
          <input type="text" id="color" placeholder="Ej. Rojo" v-model="vehiculo.color">
        </div>
        <div class="campo">
          <label for="titulo">Documento:</label>
          <select id="titulo" v-model="vehiculo.titulo" class="estilo-input" required> 
            <option disabled value="">-- Selecciona una opción --</option>
            <option v-for="opcion in opcionesTitulo" :key="opcion" :value="opcion">{{ opcion }}</option>
          </select>
        </div>
      </div>

      <hr class="separador">

      <div class="campo-multas">
        <label class="titulo-seccion">Motivos de Ingreso e Infracciones (Selecciona todas las que apliquen):</label>
        
        <div class="checkbox-grid">
          <label v-for="infraccion in catalogoInfracciones" :key="infraccion.id" class="checkbox-label">
            <input type="checkbox" :value="infraccion" v-model="multasSeleccionadas" class="checkbox-input">
            <span class="checkbox-texto">{{ infraccion.nombre }}</span>
            <span class="checkbox-precio">${{ infraccion.costo.toLocaleString('es-MX') }}</span>
          </label>
        </div>
      </div>

      <div class="ticket-cobro">
        <h3>🧾 Desglose de Infracción</h3>
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
          <span>DEUDA INICIAL TOTAL:</span>
          <span>${{ totalMulta.toLocaleString('es-MX') }} MXN</span>
        </div>
      </div>

      <hr class="separador">

      <div class="campo">
        <label>Fotografías del Vehículo</label>
        <label for="file-upload" class="input-file-trigger">Seleccionar Archivos...</label>
        <input type="file" id="file-upload" class="input-file-hidden" multiple accept="image/*" @change="handleFileUpload">
        
        <div v-if="fotos.length > 0" class="foto-preview-gallery">
          <div v-for="(foto, index) in fotos" :key="foto.url" class="foto-preview-card">
            <img :src="foto.url" alt="Vista previa">
            <button type="button" @click.stop="eliminarFoto(index)" class="btn-eliminar-foto">&times;</button>
          </div>
        </div>
      </div>

      <button type="submit" class="btn-registrar">¡Registrar y Generar Multa!</button>
    </form>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

* {
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box; /* Previene desbordamientos no deseados */
}

.formulario-container {
  position: relative; 
  width: 100%;
  max-width: 750px; 
  margin: 2rem auto; 
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1); 
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #1e293b, #0f172a);
}

h2 { 
  text-align: center; 
  margin-top: 0;
  margin-bottom: 2rem; 
  color: #f8fafc; 
  font-size: 1.8rem; 
  font-weight: 700;
  padding: 0 2rem; /* Deja espacio para que el botón no toque el texto */
}

.grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 0.5rem; }
.campo { margin-bottom: 1rem; }
label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #cbd5e1; font-size: 0.95rem; }

input, textarea, .estilo-input {
  width: 100%; padding: 0.8rem; border: 1px solid #475569; border-radius: 6px;
  background-color: #334155; color: white; font-size: 1rem; transition: all 0.3s;
}
input:focus, .estilo-input:focus { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2); outline: none; }
input::placeholder { color: #94a3b8; }

.separador { border: 0; height: 1px; background: #334155; margin: 2rem 0; }

/* --- ESTILOS DE LOS CHECKBOXES (MULTAS) --- */
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

/* --- ESTILOS DEL TICKET DE COBRO --- */
.ticket-cobro {
  background-color: #f8fafc; color: #0f172a; padding: 1.5rem; border-radius: 8px; margin-top: 1.5rem;
  border-left: 6px solid #10b981; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.ticket-cobro h3 { margin: 0 0 1rem 0; font-size: 1.2rem; border-bottom: 2px dashed #cbd5e1; padding-bottom: 0.5rem; color: #334155; font-weight: 700;}
.lista-cobro { list-style: none; padding: 0; margin: 0 0 1rem 0; }
.lista-cobro li { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem; color: #475569; font-weight: 500;}
.total-cobro { display: flex; justify-content: space-between; font-size: 1.3rem; font-weight: 900; color: #0f172a; border-top: 2px dashed #cbd5e1; padding-top: 1rem; }

.btn-registrar { width: 100%; padding: 1rem; border: none; border-radius: 8px; background: linear-gradient(to right, #ef4444, #b91c1c); color: white; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: all 0.3s; text-transform: uppercase; letter-spacing: 1px; margin-top: 1rem; }
.btn-registrar:hover { background: linear-gradient(to right, #dc2626, #991b1b); transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.4); }

.input-file-trigger { display: block; width: 100%; padding: 1rem; border: 2px dashed #475569; border-radius: 8px; background: rgba(51, 65, 85, 0.5); color: #cbd5e1; font-size: 1rem; font-weight: 600; text-align: center; cursor: pointer; transition: all 0.3s; box-sizing: border-box; }
.input-file-trigger:hover { border-color: #38bdf8; color: #38bdf8; background: rgba(56, 189, 248, 0.05); }
.input-file-hidden { display: none; }
.foto-preview-gallery { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem; }
.foto-preview-card { position: relative; width: 100px; height: 100px; border-radius: 8px; overflow: hidden; border: 2px solid #334155; }
.foto-preview-card img { width: 100%; height: 100%; object-fit: cover; }
.btn-eliminar-foto { position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; border-radius: 50%; background-color: rgba(239, 68, 68, 0.9); color: white; border: none; display: flex; justify-content: center; align-items: center; font-size: 1.2rem; cursor: pointer; transition: background-color 0.2s; }
.btn-eliminar-foto:hover { background-color: #b91c1c; }

/* CORRECCIÓN: Botón lateral ahora vive dentro del contenedor */
.btn-reset-lateral { 
  position: absolute; 
  top: 20px; 
  right: 20px; 
  width: 45px; 
  height: 45px; 
  background-color: rgba(51, 65, 85, 0.8); 
  border: 1px solid #475569; 
  border-radius: 50%; 
  color: white; 
  font-size: 1.2rem; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  transition: all 0.3s; 
  box-shadow: 0 4px 10px rgba(0,0,0,0.3); 
  z-index: 10; 
}
.btn-reset-lateral:hover { 
  background-color: #ef4444; 
  border-color: #ef4444;
  transform: rotate(180deg); 
}

@media (max-width: 768px) {
  .grid-2-col { grid-template-columns: 1fr; }
  .formulario-container { padding: 1.5rem; }
}
</style>