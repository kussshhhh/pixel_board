import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import db from './db.js'; // Import the database setup

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.get('/images', (req, res) => {
    const images = db.prepare('SELECT * FROM images').all();
    res.json(images.map(image => ({
        ...image,
        tags: JSON.parse(image.tags) // Parse tags back to array
    })));
});

app.post('/images', (req, res) => {
    const { src, tags, x, y } = req.body;
    const stmt = db.prepare('INSERT INTO images (src, tags, x, y) VALUES (?, ?, ?, ?)');
    stmt.run(src, JSON.stringify(tags || []), x, y);  // Default to empty array if tags is undefined
    res.status(201).send();
});

app.put('/images/:id', (req, res) => {
    const { id } = req.params;
    const { src, tags, x, y } = req.body;
    const stmt = db.prepare('UPDATE images SET src = ?, tags = ?, x = ?, y = ? WHERE id = ?');
    stmt.run(src, JSON.stringify(tags || []), x, y, id);  // Default to empty array if tags is undefined
    res.status(200).send();
});

app.delete('/images/:id', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM images WHERE id = ?');
    stmt.run(id);
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

