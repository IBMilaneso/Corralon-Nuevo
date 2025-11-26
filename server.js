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
app.post('/api/registrar-vehiculo', upload.array('fotos', 20), async (req, res) => {
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
    // Excluye los vehículos donde liberado_el NO es nulo
    const sql = "SELECT * FROM vehiculos WHERE liberado_el IS NULL ORDER BY fecha_ingreso DESC";
    const [rows] = await pool.query(sql);

    const vehiculos = rows.map(v => ({
      ...v,
      fotos: JSON.parse(v.fotos || '[]')
    }));

    res.status(200).json(vehiculos);
  } catch (error) { /* ...manejo de errores... */ }
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
    // Contamos el total SÓLO de los no liberados
    const [totalRows] = await pool.query("SELECT COUNT(*) as total FROM vehiculos WHERE liberado_el IS NULL");

    // Contamos las liberaciones que se hicieron HOY
    const [liberadosRows] = await pool.query("SELECT COUNT(*) as total FROM vehiculos WHERE DATE(liberado_el) = CURDATE()");

    const [hoyRows] = await pool.query("SELECT COUNT(*) as total FROM vehiculos WHERE DATE(fecha_ingreso) = CURDATE() AND liberado_el IS NULL");

    res.status(200).json({
      totalVehiculos: totalRows[0].total,
      ingresosHoy: hoyRows[0].total,
      liberadosHoy: liberadosRows[0].total // <-- El nuevo stat
    });
  } catch (error) { /* ...manejo de errores... */ }
});

// ===========================================
// == RUTA PUT (ACTUALIZADA PARA FOTOS) ==
// ===========================================
app.put('/api/vehiculos/:id', upload.array('fotosNuevas', 20), async (req, res) => {
  try {
    const id = req.params.id;

    // 1. Obtenemos los datos de texto
    const { placa, marca, modelo, anio, color, titulo, motivo } = req.body;

    // 2. Obtenemos la lista de fotos existentes que el usuario DECIDIÓ CONSERVAR
    const fotosActuales = JSON.parse(req.body.fotosActualesJson || '[]');

    // 3. Obtenemos las fotos nuevas que se acaban de subir
    const fotosNuevas = req.files ? req.files.map(f => f.path) : [];

    // 4. Combinamos ambas listas
    const fotosFinales = [...fotosActuales, ...fotosNuevas];

    // 5. Convertimos la lista final a JSON para guardarla en la BD
    const fotosJson = JSON.stringify(fotosFinales);

    // 6. Creamos la consulta SQL para actualizar TODO
    const sql = `
      UPDATE vehiculos 
      SET 
        placa = ?, marca = ?, modelo = ?, anio = ?, 
        color = ?, titulo = ?, motivo = ?, fotos = ?
      WHERE id = ?
    `;

    // 7. Ejecutamos la consulta
    await pool.query(sql, [
      placa, marca, modelo, anio, color, titulo, motivo, 
      fotosJson, // La nueva lista de fotos
      id
    ]);

    res.status(200).json({ message: '¡Vehículo actualizado con éxito!' });

  } catch (error) {
    console.error('Error al actualizar el vehículo:', error);
    res.status(500).json({ message: 'Error en el servidor al actualizar' });
  }
});


// ===========================================
// == NUEVA RUTA: ACTUALIZAR ESTATUS (PATCH) ==
// ===========================================
// Usamos PATCH porque es una actualización parcial
app.patch('/api/vehiculos/:id/estatus', async (req, res) => {
  try {
    const id = req.params.id;
    const { estatus } = req.body; 

    let sql = "UPDATE vehiculos SET estatus = ?";
    let params = [estatus];

    // Lógica de Soft Delete: Si el estatus es 'Liberar', guardamos la fecha y hora.
    if (estatus === 'Liberar') {
      sql += ", liberado_el = NOW()";
    } else {
      // Si cambian a otro estatus, limpiamos la fecha de liberación
      sql += ", liberado_el = NULL";
    }

    sql += " WHERE id = ?";
    params.push(id); // Añadimos el ID como último parámetro

    await pool.query(sql, params);

    res.status(200).json({ message: '¡Estatus actualizado con éxito!' });

  } catch (error) { /* ...manejo de errores... */ }
});


// ===========================================
// == RUTA DE MANTENIMIENTO: HARD DELETE ==
// ===========================================
// Elimina permanentemente los registros marcados como liberados hace más de 7 días
app.delete('/api/maintenance/clean-releases', async (req, res) => {
  try {
    // SQL para eliminar registros donde la fecha de liberación sea hace más de 7 días
    const sql = `
      DELETE FROM vehiculos 
      WHERE liberado_el IS NOT NULL 
      AND liberado_el < DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `;

    const [result] = await pool.query(sql);

    res.status(200).json({ 
      message: `Mantenimiento exitoso. Se eliminaron ${result.affectedRows} registros liberados.`,
      count: result.affectedRows
    });
  } catch (error) {
    console.error('Error en mantenimiento de liberación:', error);
    res.status(500).json({ message: 'Error en el servidor de mantenimiento' });
  }
});

// ===========================================
// == RUTA: ELIMINAR UN VEHÍCULO (DELETE) ==
// ===========================================
app.delete('/api/vehiculos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const sql = "DELETE FROM vehiculos WHERE id = ?";
    
    const [result] = await pool.query(sql, [id]);
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    res.status(200).json({ message: 'Vehículo eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// ===========================================
// == RUTA: INICIAR SESIÓN (LOGIN) ==
// ===========================================
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Buscamos si existe un usuario con ese nombre Y esa contraseña
    const sql = "SELECT * FROM usuarios WHERE username = ? AND password = ?";
    const [rows] = await pool.query(sql, [username, password]);

    if (rows.length > 0) {
      // ¡Encontrado!
      res.status(200).json({ success: true, message: 'Login correcto', user: rows[0].username });
    } else {
      // No coinciden
      res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor (v2.0) escuchando en http://localhost:${port} y conectado a MySQL`);
});