const express = require("express");
const path = require("path");
const tareasService = require("./tareasService");
const usuariosService = require("./usuariosService");

const app = express();
app.use(express.json());

// Servir frontend como público
app.use(express.static(path.join(__dirname, "../FRONTEND")));

// ================== RUTAS USUARIOS ==================
app.post("/register", async (req, res) => {
    try {
        const user = await usuariosService.registrar(req.body);
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post("/login", async (req, res) => {
    try {
        const data = await usuariosService.login(req.body);
        res.json(data);
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

// ================== MIDDLEWARE AUTENTICACIÓN ==================
const auth = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Token requerido" });

    try {
        req.user = usuariosService.verificarToken(token);
        next();
    } catch {
        res.status(401).json({ error: "Token inválido" });
    }
};

// ================== RUTAS TAREAS ==================
app.get("/tareas", auth, async (req, res) => {
    const tareas = await tareasService.obtener(req.user);
    res.json(tareas);
});

app.post("/tareas", auth, async (req, res) => {
    try {
        const tarea = await tareasService.crear(req.body, req.user);
        res.json(tarea);
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
});

app.put("/tareas/:id", auth, async (req, res) => {
    const tarea = await tareasService.actualizar(req.params.id, req.body, req.user);
    res.json(tarea);
});

app.delete("/tareas/:id", auth, async (req, res) => {
    await tareasService.eliminar(req.params.id, req.user);
    res.json({ ok: true });
});

// ================== ERROR 404 ==================
app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada", ruta: req.originalUrl });
});

app.listen(3000, () => console.log("Servidor activo en http://localhost:3000"));
