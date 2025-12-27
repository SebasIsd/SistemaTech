// server/index.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a la base de datos
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Inicializar la base de datos
const initDB = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'cajero' CHECK (role IN ('admin', 'cajero')),
        is_active BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dni TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER DEFAULT 0,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        client_id INTEGER REFERENCES clients(id),
        user_id INTEGER REFERENCES profiles(id),
        subtotal REAL DEFAULT 0,
        tax_amount REAL DEFAULT 0,
        total REAL DEFAULT 0,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'paid', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unit_price REAL NOT NULL,
        row_total REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
        amount REAL NOT NULL,
        payment_method TEXT CHECK (payment_method IN ('efectivo', 'tarjeta', 'transferencia')),
        payment_date DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insertar usuario admin por defecto si no existe
    db.get('SELECT 1 FROM profiles WHERE email = ?', ['admin@factura.com'], (err, row) => {
      if (!row) {
        const hashedPassword = bcrypt.hashSync('12345678', 10);
        db.run(`
          INSERT INTO profiles (name, email, password, role, is_active) 
          VALUES (?, ?, ?, ?, ?)
        `, ['Administrador', 'admin@factura.com', hashedPassword, 'admin', 1]);
      }
    });
  });
};

initDB();

// Rutas de autenticación
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM profiles WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'Usuario no activado' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Remover la contraseña del objeto de usuario
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
});

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);
  
  db.run(`
    INSERT INTO profiles (name, email, password, role, is_active) 
    VALUES (?, ?, ?, ?, ?)
  `, [name, email, hashedPassword, 'cajero', 0], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Email ya registrado' });
      }
      return res.status(500).json({ error: 'Error al registrar usuario' });
    }
    
    const newUser = {
      id: this.lastID,
      name,
      email,
      role: 'cajero',
      is_active: 0
    };

    res.json(newUser);
  });
});

app.get('/api/users', (req, res) => {
  db.all('SELECT id, name, email, role, is_active, created_at FROM profiles ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    res.json(rows);
  });
});

app.put('/api/users/:id/activate', (req, res) => {
  const { id } = req.params;
  
  db.run('UPDATE profiles SET is_active = 1 WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ message: 'Usuario activado correctamente' });
  });
});

app.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});