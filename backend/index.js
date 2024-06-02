const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database connected');
    db.run(`
      CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        src TEXT,
        x INTEGER,
        y INTEGER,
        tags TEXT
      )
    `);
  }
});

// API Endpoints
app.get('/images', (req, res) => {
  db.all('SELECT * FROM images', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ images: rows });
  });
});

app.post('/images', (req, res) => {
  const { src, x, y, tags } = req.body;
  db.run(`INSERT INTO images (src, x, y, tags) VALUES (?, ?, ?, ?)`, [src, x, y, JSON.stringify(tags)], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

app.delete('/images/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM images WHERE id = ?`, id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

