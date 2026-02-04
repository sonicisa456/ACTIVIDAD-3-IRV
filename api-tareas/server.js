const express = require("express");
const { leerTareas, guardarTareas } = require("./utils/fileManager");

const app = express();
const PORT = 3000;

app.use(express.json());


// RUTA DE PRUEBA
app.get("/", (req, res) => {
    res.json({ mensaje: "API de Tareas funcionando 🚀" });
});


// GET /tareas
app.get("/tareas", async (req, res, next) => {
    try {
        const tareas = await leerTareas();
        res.json(tareas);
    } catch (error) {
        next(error);
    }
});


// POST /tareas
app.post("/tareas", async (req, res, next) => {
    try {
        const { titulo, descripcion } = req.body;

        if (!titulo || !descripcion) {
            return res.status(400).json({ error: "Título y descripción son obligatorios" });
        }

        const tareas = await leerTareas();

        const nuevaTarea = {
            id: Date.now(),
            titulo,
            descripcion
        };

        tareas.push(nuevaTarea);
        await guardarTareas(tareas);

        res.status(201).json(nuevaTarea);
    } catch (error) {
        next(error);
    }
});


// PUT /tareas/:id
app.put("/tareas/:id", async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { titulo, descripcion } = req.body;

        const tareas = await leerTareas();
        const index = tareas.findIndex(t => t.id === id);

        if (index === -1) {
            return res.status(404).json({ error: "Tarea no encontrada" });
        }

        tareas[index].titulo = titulo || tareas[index].titulo;
        tareas[index].descripcion = descripcion || tareas[index].descripcion;

        await guardarTareas(tareas);
        res.json(tareas[index]);
    } catch (error) {
        next(error);
    }
});


// DELETE /tareas/:id
app.delete("/tareas/:id", async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);

        const tareas = await leerTareas();
        const nuevasTareas = tareas.filter(t => t.id !== id);

        if (tareas.length === nuevasTareas.length) {
            return res.status(404).json({ error: "Tarea no encontrada" });
        }

        await guardarTareas(nuevasTareas);
        res.json({ mensaje: "Tarea eliminada correctamente" });
    } catch (error) {
        next(error);
    }
});


// MANEJO GLOBAL DE ERRORES
app.use((err, req, res, next) => {
    console.error("ERROR:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
});


// INICIAR SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor activo en http://localhost:${PORT}`);
});


