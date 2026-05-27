require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sql = require('mssql');

const app = express();
const port = 3000;  

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Conectado');
        return pool;
    })
    .catch(err => {
        console.error('Error al conectar a SQL Server:', err);
        process.exit(1);
    });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

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


app.post('/api/registrar-vehiculo', upload.array('fotos', 20), async (req, res) => {
  const { placa, marca, modelo, anio, titulo, color, motivo, deuda_inicial } = req.body;
  
  // file.path recupera la ruta relativa completa (ej. "uploads\\fotos-...")
  const rutasFotos = req.files ? req.files.map(file => file.path) : [];
  const fotosJson = JSON.stringify(rutasFotos); 

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('placa', sql.VarChar(20), placa)
      .input('marca', sql.VarChar(50), marca)
      .input('modelo', sql.VarChar(50), modelo)
      .input('anio', sql.Int, anio)
      .input('titulo', sql.VarChar(100), titulo)
      .input('color', sql.VarChar(30), color)
      .input('motivo', sql.Text, motivo)
      .input('fotos', sql.Text, fotosJson)
      .input('deuda_inicial', sql.Int, parseInt(deuda_inicial || 0)) 
      .query(`
        INSERT INTO Vehiculos (placa, marca, modelo, anio, titulo, color, motivo, fotos, deuda_inicial)
        VALUES (@placa, @marca, @modelo, @anio, @titulo, @color, @motivo, @fotos, @deuda_inicial)
      `);

    res.status(201).json({ message: 'Vehículo y multas registrados con éxito.' });
  } catch (error) {
    console.error('Error al insertar en la base de datos:', error);
    res.status(500).json({ message: 'Error al registrar el vehículo.' });
  }
});


app.get('/api/vehiculos', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM vehiculos WHERE liberado_el IS NULL ORDER BY fecha_ingreso DESC");

        const vehiculos = result.recordset.map(v => ({
            ...v,
            fotos: JSON.parse(v.fotos || '[]')
        }));

        res.status(200).json(vehiculos);
    } catch (error) { 
        console.error(error);
        res.status(500).json({ message: 'Error al obtener vehiculos' });
    }
});


app.get('/api/vehiculos/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query("SELECT * FROM vehiculos WHERE id = @id");

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Vehículo no encontrado' });
        }

        const vehiculo = {
            ...result.recordset[0],
            fotos: JSON.parse(result.recordset[0].fotos || '[]')
        };
        
        res.status(200).json(vehiculo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});


app.get('/api/stats', async (req, res) => {
    try {
        const pool = await poolPromise;
        
        const total = await pool.request().query("SELECT COUNT(*) as total FROM vehiculos WHERE liberado_el IS NULL");
        const liberados = await pool.request().query("SELECT COUNT(*) as total FROM vehiculos WHERE CAST(liberado_el AS DATE) = CAST(GETDATE() AS DATE)");
        const hoy = await pool.request().query("SELECT COUNT(*) as total FROM vehiculos WHERE CAST(fecha_ingreso AS DATE) = CAST(GETDATE() AS DATE) AND liberado_el IS NULL");

        res.status(200).json({
            totalVehiculos: total.recordset[0].total,
            ingresosHoy: hoy.recordset[0].total,
            liberadosHoy: liberados.recordset[0].total
        });
    } catch (error) { 
        console.error(error);
        res.status(500).json({ message: 'Error en stats' });
    }
});


app.put('/api/vehiculos/:id', upload.array('fotosNuevas', 20), async (req, res) => {
    try {
        const id = req.params.id;
        const { placa, marca, modelo, anio, color, titulo, motivo, deuda_inicial } = req.body;
        const fotosActuales = JSON.parse(req.body.fotosActualesJson || '[]');
        const fotosNuevas = req.files ? req.files.map(f => f.path) : [];
        const fotosJson = JSON.stringify([...fotosActuales, ...fotosNuevas]);

        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('placa', sql.VarChar, placa)
            .input('marca', sql.VarChar, marca)
            .input('modelo', sql.VarChar, modelo)
            .input('anio', sql.Int, anio)
            .input('color', sql.VarChar, color)
            .input('titulo', sql.VarChar, titulo)
            .input('motivo', sql.Text, motivo)
            .input('fotos', sql.Text, fotosJson)
            .input('deuda_inicial', sql.Int, parseInt(deuda_inicial || 0))
            .query(`UPDATE vehiculos 
                    SET placa=@placa, marca=@marca, modelo=@modelo, anio=@anio, color=@color, 
                        titulo=@titulo, motivo=@motivo, fotos=@fotos, deuda_inicial=@deuda_inicial
                    WHERE id=@id`);
            
        res.status(200).json({ message: '¡Vehículo actualizado!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar' });
    }
});


app.patch('/api/vehiculos/:id/estatus', async (req, res) => {
    try {
        const id = req.params.id;
        const { estatus } = req.body; 
        const pool = await poolPromise;


        const query = estatus === 'Liberar' 
            ? "UPDATE vehiculos SET estatus = @estatus, liberado_el = GETDATE() WHERE id = @id"
            : "UPDATE vehiculos SET estatus = @estatus, liberado_el = NULL WHERE id = @id";

        await pool.request()
            .input('id', sql.Int, id)
            .input('estatus', sql.VarChar, estatus)
            .query(query);

        res.status(200).json({ message: 'Estatus actualizado' });
    } catch (error) { 
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar estatus' });
    }
});


app.delete('/api/vehiculos/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM vehiculos WHERE id = @id");
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Vehículo no encontrado' });
        }
        res.status(200).json({ message: 'Eliminado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar' });
    }
});


app.post('/api/login/empleados', async (req, res) => {
    const { username, password } = req.body;
    const pool = await poolPromise;
    const result = await pool.request()
        .input('user', sql.VarChar, username)
        .input('pass', sql.VarChar, password)
        // AQUI ESTÁ EL CAMBIO: FROM empleados
        .query("SELECT username, rol FROM empleados WHERE username = @user AND password = @pass");

    if (result.recordset.length > 0) {
        res.status(200).json({ 
            success: true, 
            user: result.recordset[0].username,
            rol: result.recordset[0].rol // Enviamos el rol al frontend
        });
    } else {
        res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
});


app.get('/api/reportes/productividad', async (req, res) => {
    try {
        const pool = await poolPromise;
        
        // Ejecutamos la consulta con agrupaciones que hicimos hace un momento
        const result = await pool.request().query(`
            SELECT 
                estatus AS EstadoActual, 
                COUNT(*) AS TotalVehiculos
            FROM vehiculos
            GROUP BY estatus
        `);
        
        res.json(result.recordset);
    } catch (err) {
        console.error("Error al generar reporte:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/registro/ciudadanos', async (req, res) => {
    try {
        const { nombre, apellidos, rfc, licencia, correo, password } = req.body;
        const pool = await poolPromise;

        // Validamos que el correo o RFC no existan ya en la base de datos
        const checkUser = await pool.request()
            .input('correo', sql.VarChar, correo)
            .input('rfc', sql.VarChar, rfc)
            .query("SELECT * FROM usuarios WHERE correo = @correo OR rfc = @rfc");

        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'El correo o RFC ya están registrados.' 
            });
        }

        // Insertamos al nuevo ciudadano
        await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('apellidos', sql.VarChar, apellidos)
            .input('rfc', sql.VarChar, rfc)
            .input('licencia', sql.VarChar, licencia)
            .input('correo', sql.VarChar, correo)
            .input('password', sql.VarChar, password) // Nota: en un entorno real de producción, esto se encripta
            .query(`INSERT INTO usuarios (nombre, apellidos, rfc, num_licencia, correo, password) 
                    VALUES (@nombre, @apellidos, @rfc, @licencia, @correo, @password)`);

        res.status(200).json({ success: true, message: 'Registro exitoso. Ya puedes iniciar sesión.' });
    } catch (error) {
        console.error("Error en registro ciudadano:", error);
        res.status(500).json({ success: false, message: 'Error al registrar al ciudadano en el servidor.' });
    }
});

app.post('/api/login/ciudadanos', async (req, res) => {
    try {
        const { correo, password } = req.body;
        const pool = await poolPromise;
        
        // Buscamos en la nueva tabla 'usuarios'
        const result = await pool.request()
            .input('correo', sql.VarChar, correo)
            .input('password', sql.VarChar, password)
            .query("SELECT id_usuario, nombre, rfc FROM usuarios WHERE correo = @correo AND password = @password");

        if (result.recordset.length > 0) {
            res.status(200).json({ 
                success: true, 
                nombre: result.recordset[0].nombre,
                rfc: result.recordset[0].rfc,
                rol: 'ciudadano' // Le inyectamos este rol para que tu Sidebar sepa qué botones ocultarle
            });
        } else {
            res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error("Error en login ciudadano:", error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

app.post('/api/reclamos', async (req, res) => {
  // Extraemos los datos que nos manda Vue.js
  const { rfc, licencia, correo, vehiculoId } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('vehiculo_id', sql.Int, vehiculoId)
      .input('rfc', sql.VarChar(13), rfc)
      .input('licencia', sql.VarChar(20), licencia)
      .input('correo', sql.VarChar(100), correo)
      .query(`
        INSERT INTO SolicitudesReclamo (vehiculo_id, rfc, licencia, correo)
        VALUES (@vehiculo_id, @rfc, @licencia, @correo)
      `);
      
    res.status(201).json({ message: 'Solicitud de reclamo guardada exitosamente.' });
  } catch (error) {
    console.error('Error al guardar el reclamo:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// 2. Ruta para registrar un Interés de Compra
app.post('/api/compras', async (req, res) => {
  const { nombre, telefono, correo, mensaje, vehiculoId } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('vehiculo_id', sql.Int, vehiculoId)
      .input('nombre', sql.VarChar(100), nombre)
      .input('telefono', sql.VarChar(10), telefono)
      .input('correo', sql.VarChar(100), correo)
      .input('mensaje', sql.Text, mensaje)
      .query(`
        INSERT INTO SolicitudesCompra (vehiculo_id, nombre, telefono, correo, mensaje)
        VALUES (@vehiculo_id, @nombre, @telefono, @correo, @mensaje)
      `);
      
    res.status(201).json({ message: 'Solicitud de compra guardada exitosamente.' });
  } catch (error) {
    console.error('Error al guardar la compra:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});


app.listen(port, () => {
    console.log(`🚀 Servidor en ejecución en puerto ${port} (SQL Server Mode)`);
});

