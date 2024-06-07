import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import db from './db.js'; // Import the database setup

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({limit: "50mb"}));

app.get('/images', (req, res) => {
    const images = db.prepare('SELECT * FROM images').all();
    res.json(images.map(image => ({
        ...image,
        tags: JSON.parse(image.tags) // Parse tags back to array
    })));
});

app.post('/images', (req, res) => {
    const { src, tags, x, y } = req.body;
    console.log(req) ;
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

app.post('/images/delete', (req, res) => {
    const { images } = req.body;

    let data = '';
    try{
        req.on('data', chunk => {
            data += chunk; // Collecting the chunks of data
            // console.log(chunk) ;
        });

        req.on('end', () => {
            const parsedData = JSON.parse(data); // Parsing the complete data
            const imagesToDelete = parsedData.images; // Extracting the images array
            console.log(imagesToDelete) ;   
            // Process the imagesToDelete array here
                const stmt = db.prepare('DELETE FROM images WHERE id = ?');
                db.transaction(() => {
                    for (const id of imagesToDelete) {
                        stmt.run(id);
                    }
                })();
            res.sendStatus(200); // Sending a success response
        });

    }catch(error){
        console.log('error',error) ;
    }

    // try {
    //     if(imagesToDelete.length > 0){
    //         const stmt = db.prepare('DELETE FROM images WHERE id = ?');
    //         db.transaction(() => {
    //             for (const id of imagesToDelete) {
    //                 stmt.run(id);
    //             }
    //         })();

    //     }
    //     else{
    //         console.log("hum pe toh hai na")
    //     }

    //     res.status(200).send('Images deleted successfully');
    // } catch (error) {
    //     console.error('Error deleting images:', error);
    //     res.status(500).send('Internal Server Error');
    // }
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

