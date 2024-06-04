// db.js
import Database from 'better-sqlite3';

const db = new Database('./db.sqlite', { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    src TEXT,
    tags TEXT,
    x INTEGER,
    y INTEGER
  )
`);

export default db;
