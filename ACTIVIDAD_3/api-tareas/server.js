// server.js

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises; // Para trabajar con archivos de manera asincrónica
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Ruta base de prueba
app.get('/', (req, res) => {
    res.send('¡Servidor Express funcionando correctamente!');
});

// Ruta GET /tareas - Devuelve todas las tareas
app.get('/tareas', async (req, res, next) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'tareas.json'), 'utf8');
        const tareas = JSON.parse(data);
        res.json(tareas);
    } catch (err) {
        next(err);
    }
});

// Ruta POST /tareas - Agregar nueva tarea
app.post('/tareas', async (req, res, next) => {
    try {
        const { titulo, descripcion } = req.body;
        if (!titulo || !descripcion) {
            return res.status(400).json({ error: 'Se requiere título y descripción' });
        }

        const data = await fs.readFile(path.join(__dirname, 'tareas.json'), 'utf8');
        const tareas = JSON.parse(data);

        const nuevaTarea = {
            id: Date.now(), // ID único basado en timestamp
            titulo,
            descripcion
        };

        tareas.push(nuevaTarea);
        await fs.writeFile(path.join(__dirname, 'tareas.json'), JSON.stringify(tareas, null, 2));

        res.status(201).json(nuevaTarea);
    } catch (err) {
        next(err);
    }
});

// Ruta PUT /tareas/:id - Actualizar tarea existente
app.put('/tareas/:id', async (req, res, next) => {
    try {
        const tareaId = parseInt(req.params.id);
        const { titulo, descripcion } = req.body;

        const data = await fs.readFile(path.join(__dirname, 'tareas.json'), 'utf8');
        const tareas = JSON.parse(data);

        const tareaIndex = tareas.findIndex(t => t.id === tareaId);
        if (tareaIndex === -1) return res.status(404).json({ error: 'Tarea no encontrada' });

        // Actualizar los campos si se proporcionan
        if (titulo) tareas[tareaIndex].titulo = titulo;
        if (descripcion) tareas[tareaIndex].descripcion = descripcion;

        await fs.writeFile(path.join(__dirname, 'tareas.json'), JSON.stringify(tareas, null, 2));

        res.json(tareas[tareaIndex]);
    } catch (err) {
        next(err);
    }
});

// Ruta DELETE /tareas/:id - Eliminar tarea
app.delete('/tareas/:id', async (req, res, next) => {
    try {
        const tareaId = parseInt(req.params.id);

        const data = await fs.readFile(path.join(__dirname, 'tareas.json'), 'utf8');
        let tareas = JSON.parse(data);

        const tareaIndex = tareas.findIndex(t => t.id === tareaId);
        if (tareaIndex === -1) return res.status(404).json({ error: 'Tarea no encontrada' });

        const tareaEliminada = tareas.splice(tareaIndex, 1)[0];

        await fs.writeFile(path.join(__dirname, 'tareas.json'), JSON.stringify(tareas, null, 2));

        res.json({ mensaje: 'Tarea eliminada', tarea: tareaEliminada });
    } catch (err) {
        next(err);
    }
});

// Manejo de rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Ocurrió un error en el servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
