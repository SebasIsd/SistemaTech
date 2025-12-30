// server.js
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Allow cross-origin requests from frontend
app.use(bodyParser.json());

// MySQL Connection Pool (better for production, handles multiple connections)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Change if your MySQL user is different
  password: '', // Set your MySQL password here
  database: 'facturacion',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
  connection.release();
});

// Register new user (POST /api/register)
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password

    const [existingUser] = await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    await pool.promise().query(
      'INSERT INTO users (name, email, password, is_active) VALUES (?, ?, ?, 0)',
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully. Awaiting activation.' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login (POST /api/login)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const [users] = await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.is_active === 0) {
      return res.status(403).json({ error: 'Account not activated' });
    }

    // Return user data (exclude password)
    const { password: _, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (GET /api/users) - For admin
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await pool.promise().query('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Activate user (PUT /api/users/:id/activate)
app.put('/api/users/:id/active', async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body; // 0 o 1

  if (![0, 1].includes(is_active)) {
    return res.status(400).json({ error: 'Valor de is_active inválido (0 o 1)' });
  }

  try {
    const [result] = await pool.promise().query(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

// 3. Actualizar rol y/o estado (endpoint más completo)
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { rol, is_active } = req.body;

  // Validación básica
  if (rol && !['admin', 'user'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido. Debe ser "admin" o "user"' });
  }

  if (is_active !== undefined && ![0, 1].includes(Number(is_active))) {
    return res.status(400).json({ error: 'is_active debe ser 0 o 1' });
  }

  try {
    let query = 'UPDATE users SET ';
    const params = [];

    if (rol !== undefined) {
      query += 'rol = ?, ';
      params.push(rol);
    }
    if (is_active !== undefined) {
      query += 'is_active = ?, ';
      params.push(Number(is_active));
    }

    // Quitamos la última coma y espacio
    query = query.slice(0, -2);
    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.promise().query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// 4. Eliminar usuario
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.promise().query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// Endpoints adicionales para facturas, inventario, etc. pueden ser añadidos aquí
// GET /api/dashboard/stats - Estadísticas generales
// GET /api/dashboard/stats - Estadísticas generales
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Verificar si las tablas existen y ajustar según tu estructura
    const [ventasHoy] = await pool.promise().query(
      `SELECT COUNT(*) as count FROM facturas WHERE DATE(fecha_emision) = CURDATE()`
    );
    const [ingresosMes] = await pool.promise().query(
      `SELECT SUM(total) as sum FROM facturas WHERE MONTH(fecha_emision) = MONTH(CURDATE()) AND YEAR(fecha_emision) = YEAR(CURDATE())`
    );
    const [usuariosActivos] = await pool.promise().query(
      `SELECT COUNT(*) as count FROM users WHERE is_active = 1`
    );
    const [facturasPendientes] = await pool.promise().query(
      `SELECT COUNT(*) as count FROM facturas WHERE estado = 'pendiente'`
    );

    res.json({
      ventasHoy: ventasHoy[0].count,
      ingresosMes: ingresosMes[0].sum || 0,
      usuariosActivos: usuariosActivos[0].count,
      facturasPendientes: facturasPendientes[0].count,
    });
  } catch (error) {
    console.error('Error en stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// GET /api/dashboard/ventas-semana - Datos para gráfico de ventas semanales
app.get('/api/dashboard/ventas-semana', async (req, res) => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT DAYOFWEEK(fecha_emision) as dia, SUM(total) as total 
       FROM facturas 
       WHERE fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
       GROUP BY dia 
       ORDER BY dia`
    );
    const labels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const data = Array(7).fill(0);
    rows.forEach(row => {
      data[row.dia - 1] = row.total; // DAYOFWEEK: 1=Dom, 2=Lun, etc.
    });

    res.json({ labels, data });
  } catch (error) {
    console.error('Error en ventas semana:', error);
    res.status(500).json({ error: 'Error al obtener ventas semanales' });
  }
});

// GET /api/dashboard/ultimas-facturas - Últimas 5 facturas
app.get('/api/dashboard/ultimas-facturas', async (req, res) => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT f.id, c.nombre as cliente, f.total as monto, f.fecha_emision as fecha
       FROM facturas f
       JOIN clientes c ON f.cliente_id = c.id
       ORDER BY f.fecha_emision DESC
       LIMIT 5`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en últimas facturas:', error);
    res.status(500).json({ error: 'Error al obtener últimas facturas' });
  }
});

// GET /api/dashboard/actividad-reciente - Últimas 5 actividades
app.get('/api/dashboard/actividad-reciente', async (req, res) => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT descripcion, created_at FROM actividad ORDER BY created_at DESC LIMIT 5`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener actividad' });
  }
});


// Rutas para Productos
// GET /api/productos - Listar todos
app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await pool.promise().query('SELECT * FROM productos ORDER BY nombre');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar productos' });
  }
});

// GET /api/productos/:id - Detalle de un producto
app.get('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.promise().query('SELECT * FROM productos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// POST /api/productos - Crear producto
app.post('/api/productos', async (req, res) => {
  const { nombre, descripcion, precio, categoria, requiere_lote } = req.body;
  try {
    const [result] = await pool.promise().query(
      'INSERT INTO productos (nombre, descripcion, precio, categoria, requiere_lote) VALUES (?, ?, ?, ?, ?)',
      [nombre, descripcion, precio, categoria, requiere_lote || 1]
    );
    res.status(201).json({ id: result.insertId, message: 'Producto creado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT /api/productos/:id - Actualizar producto
app.put('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, categoria, requiere_lote } = req.body;
  try {
    await pool.promise().query(
      'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria = ?, requiere_lote = ? WHERE id = ?',
      [nombre, descripcion, precio, categoria, requiere_lote, id]
    );
    res.json({ message: 'Producto actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE /api/productos/:id - Eliminar producto (cascada elimina lotes)
app.delete('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.promise().query('DELETE FROM productos WHERE id = ?', [id]);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// Rutas para Lotes
// GET /api/productos/:id/lotes - Listar lotes de un producto (orden FIFO)
app.get('/api/productos/:id/lotes', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.promise().query(
      'SELECT * FROM lotes WHERE producto_id = ? ORDER BY fecha_entrada ASC',
      [id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar lotes' });
  }
});

// POST /api/productos/:id/lotes - Agregar lote
app.post('/api/productos/:id/lotes', async (req, res) => {
  const { id } = req.params;
  const { cantidad, fecha_entrada, precio_costo, fecha_vencimiento } = req.body;
  try {
    const [result] = await pool.promise().query(
      'INSERT INTO lotes (producto_id, cantidad, cantidad_disponible, fecha_entrada, precio_costo, fecha_vencimiento) VALUES (?, ?, ?, ?, ?, ?)',
      [id, cantidad, cantidad, fecha_entrada, precio_costo, fecha_vencimiento]
    );
    res.status(201).json({ id: result.insertId, message: 'Lote agregado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar lote' });
  }
});

// PUT /api/lotes/:id - Actualizar lote
app.put('/api/lotes/:id', async (req, res) => {
  const { id } = req.params;
  const { cantidad, fecha_entrada, precio_costo, fecha_vencimiento } = req.body;
  try {
    await pool.promise().query(
      'UPDATE lotes SET cantidad = ?, cantidad_disponible = ?, fecha_entrada = ?, precio_costo = ?, fecha_vencimiento = ? WHERE id = ?',
      [cantidad, cantidad, fecha_entrada, precio_costo, fecha_vencimiento, id]
    );
    res.json({ message: 'Lote actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar lote' });
  }
});

// DELETE /api/lotes/:id - Eliminar lote
app.delete('/api/lotes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.promise().query('DELETE FROM lotes WHERE id = ?', [id]);
    res.json({ message: 'Lote eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar lote' });
  }
});

// Integración FIFO en Facturas (actualiza el POST /api/facturas si ya lo tienes, o agrégalo)
app.post('/api/facturas', async (req, res) => {
  const { cliente_id, usuario_id, detalles } = req.body;  // detalles: [{producto_id, cantidad}]
  let subtotal = 0;
  let iva = 0;  // Asume 12% IVA, ajusta según tu país
  let total = 0;

  try {
    // Iniciar transacción para atomicidad
    await pool.promise().query('START TRANSACTION');

    // Crear factura cabecera
    const [facturaResult] = await pool.promise().query(
      'INSERT INTO facturas (cliente_id, usuario_id, subtotal, iva, total) VALUES (?, ?, 0, 0, 0)',
      [cliente_id, usuario_id]
    );
    const facturaId = facturaResult.insertId;

    // Procesar cada detalle (producto)
    for (const det of detalles) {
      const { producto_id, cantidad } = det;

      // Verificar stock total
      const [prod] = await pool.promise().query('SELECT stock_total, precio FROM productos WHERE id = ?', [producto_id]);
      if (prod[0].stock_total < cantidad) throw new Error('Stock insuficiente para producto ' + producto_id);

      // FIFO: Obtener lotes ordenados por fecha_entrada ASC
      const [lotes] = await pool.promise().query(
        'SELECT * FROM lotes WHERE producto_id = ? AND cantidad_disponible > 0 ORDER BY fecha_entrada ASC',
        [producto_id]
      );

      let remaining = cantidad;
      for (const lote of lotes) {
        if (remaining <= 0) break;
        const descontar = Math.min(remaining, lote.cantidad_disponible);
        await pool.promise().query(
          'UPDATE lotes SET cantidad_disponible = cantidad_disponible - ? WHERE id = ?',
          [descontar, lote.id]
        );
        remaining -= descontar;
      }
      if (remaining > 0) throw new Error('No hay lotes suficientes para producto ' + producto_id);

      // Agregar detalle a factura
      const precioUnit = prod[0].precio;
      const subDet = precioUnit * cantidad;
      await pool.promise().query(
        'INSERT INTO detalles_factura (factura_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
        [facturaId, producto_id, cantidad, precioUnit, subDet]
      );

      subtotal += subDet;
    }

    iva = subtotal * 0.12;  // Ajusta el % de IVA
    total = subtotal + iva;

    await pool.promise().query(
      'UPDATE facturas SET subtotal = ?, iva = ?, total = ? WHERE id = ?',
      [subtotal, iva, total, facturaId]
    );

    await pool.promise().query('COMMIT');
    res.status(201).json({ id: facturaId, message: 'Factura creada, stock descontado por FIFO' });
  } catch (error) {
    await pool.promise().query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los clientes para el buscador
app.get('/api/clientesB', (req, res) => {
  pool.query('SELECT id, nombre, identificacion FROM clientes', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Rutas para Clientes (similar a productos)
app.get('/api/clientes', async (req, res) => {
  try {
    const [rows] = await pool.promise().query('SELECT * FROM clientes');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar clientes' });
  }
});

// POST /api/clientes
app.post('/api/clientes', async (req, res) => {
  const { nombre, email, telefono, direccion, identificacion } = req.body;
  try {
    const [result] = await pool.promise().query(
      'INSERT INTO clientes (nombre, email, telefono, direccion, identificacion) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, telefono, direccion, identificacion]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

// PUT /api/clientes/:id y DELETE similar a productos
app.put('/api/clientes/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email, telefono, direccion, identificacion } = req.body;
  try {
    await pool.promise().query(
      'UPDATE clientes SET nombre = ?, email = ?, telefono = ?, direccion = ?, identificacion = ? WHERE id = ?',
      [nombre, email, telefono, direccion, identificacion, id]
    );
    res.json({ message: 'Cliente actualizado' });
  }
  catch (error) {
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

app.delete('/api/clientes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // En lugar de DELETE, hacemos UPDATE
    await pool.promise().query(
      'UPDATE clientes SET estado = 0 WHERE id = ?',
      [id]
    );
    res.json({ message: 'Cliente inactivado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al inactivar cliente' });
  }
});

// Para la parte de facturas, inventario, etc., puedes agregar más endpoints según sea necesario.
// ... tus otros endpoints ...

// GET /api/facturas - Listar todas las facturas con cliente
app.get('/api/facturas', async (req, res) => {
  try {
    const [rows] = await pool.promise().query(`
      SELECT f.*, c.nombre as cliente_nombre, c.identificacion as cliente_identificacion
      FROM facturas f
      JOIN clientes c ON f.cliente_id = c.id
      ORDER BY f.fecha_emision DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al listar facturas:', error);
    res.status(500).json({ error: 'Error al listar facturas' });
  }
});

// GET /api/facturas/:id - Detalle completo de una factura
app.get('/api/facturas/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Obtener la factura principal
    const [facturaRows] = await pool.promise().query(`
      SELECT f.*, c.nombre as cliente_nombre, c.identificacion as cliente_identificacion, 
             c.direccion as cliente_direccion, c.telefono as cliente_telefono
      FROM facturas f
      JOIN clientes c ON f.cliente_id = c.id
      WHERE f.id = ?
    `, [id]);
    
    if (facturaRows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    const factura = facturaRows[0];
    
    // Obtener los detalles de la factura
    const [detallesRows] = await pool.promise().query(`
      SELECT df.*, p.nombre as producto_nombre, p.descripcion as producto_descripcion
      FROM detalles_factura df
      JOIN productos p ON df.producto_id = p.id
      WHERE df.factura_id = ?
    `, [id]);
    
    // Añadir los detalles a la factura
    factura.detalles = detallesRows;
    
    res.json(factura);
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({ error: 'Error al obtener factura' });
  }
});

// ... tus otros endpoints ...

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});