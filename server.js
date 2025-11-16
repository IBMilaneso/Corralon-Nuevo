// server.js (Versión 2.0 - Conectado a MySQL)

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise'); // <-- ¡NUEVO! Importamos el conector

const app = express();
const port = 3000;

// ===========================================
// == CONEXIÓN A BASE DE DATOS ==
// ===========================================
// Creamos un "pool" de conexiones. Es más eficiente que
// crear una conexión nueva cada vez.
const pool = mysql.createPool({
  host: '127.0.0.1',       // 'localhost' es lo mismo
  user: 'root',            // El usuario que configuraste
  password: 'P@l4br4S3cr3t4&Fuerte', // <-- ¡CAMBIA ESTO!
  database: 'corralon_bd', // El nombre de tu base de datos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// --- Configuración de Multer (Sin cambios) ---
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });


// ===========================================
// == RUTAS DE LA API (MODIFICADAS) ==
// ===========================================

// --- REGISTRAR UN VEHÍCULO (AHORA CON SQL) ---
app.post('/api/registrar-vehiculo', upload.array('fotos', 10), async (req, res) => {
  try {
    // 1. Obtenemos los datos del formulario
    const { placa, marca, modelo, anio, color, titulo, motivo } = req.body;
    
    // 2. Preparamos las fotos
    const fotosGuardadas = req.files ? req.files.map(file => file.path) : [];
    // Convertimos el array de fotos en un texto JSON para guardarlo
    const fotosJson = JSON.stringify(fotosGuardadas);

    // 3. Creamos la consulta SQL
    const sql = `
      INSERT INTO vehiculos (placa, marca, modelo, anio, color, titulo, motivo, fotos)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // 4. Ejecutamos la consulta
    await pool.query(sql, [placa, marca, modelo, anio, color, titulo, motivo, fotosJson]);
    
    res.status(200).json({ message: '¡Vehículo registrado en la BD!' });

  } catch (error) {
    console.error('Error al registrar el vehículo en la BD:', error);
    res.status(500).json({ message: 'Error en el servidor al registrar' });
  }
});

// --- OBTENER TODOS LOS VEHÍCULOS (AHORA CON SQL) ---
app.get('/api/vehiculos', async (req, res) => {
  try {
    const sql = "SELECT * FROM vehiculos ORDER BY fecha_ingreso DESC";
    const [rows] = await pool.query(sql); // [rows] extrae solo el array de resultados
    
    // Convertimos el texto JSON de las fotos de nuevo a un array
    const vehiculos = rows.map(v => ({
      ...v,
      fotos: JSON.parse(v.fotos || '[]') // Parsea las fotos
    }));

    res.status(200).json(vehiculos);
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- OBTENER UN SOLO VEHÍCULO POR ID (AHORA CON SQL) ---
app.get('/api/vehiculos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const sql = "SELECT * FROM vehiculos WHERE id = ?";
    const [rows] = await pool.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    const vehiculo = {
      ...rows[0],
      fotos: JSON.parse(rows[0].fotos || '[]')
    };
    
    res.status(200).json(vehiculo);
  } catch (error) {
    console.error('Error al obtener vehículo por ID:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- OBTENER ESTADÍSTICAS (AHORA CON SQL) ---
app.get('/api/stats', async (req, res) => {
  try {
    // 1. Contar el total de vehículos
    const [totalRows] = await pool.query("SELECT COUNT(*) as total FROM vehiculos");
    
    // 2. Contar los ingresos de hoy (CURDATE() es una función de MySQL)
    const [hoyRows] = await pool.query("SELECT COUNT(*) as total FROM vehiculos WHERE DATE(fecha_ingreso) = CURDATE()");

    res.status(200).json({
      totalVehiculos: totalRows[0].total,
      ingresosHoy: hoyRows[0].total,
      liberadosHoy: 0 // Aún no tenemos esta lógica
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor (v2.0) escuchando en http://localhost:${port} y conectado a MySQL`);
});