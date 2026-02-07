const express = require("express");
const fs = require("fs").promises;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const app = express();
const PORT = 3000;
const path = require("path");

app.use(express.static(path.join(__dirname, "../FRONTEND")));
app.use(cors());
app.use(express.json());

// Archivos
const tareasFile = "./tareas.json";
const usersFile = "./users.json";

// Middleware para verificar token
function verificarTokenMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ error: "Token requerido" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token inválido" });

    try {
        const payload = jwt.verify(token, "clave_secreta");
        req.user = payload;
        next();
    } catch (e) {
        return res.status(401).json({ error: "Token inválido" });
    }
}

// Registro de usuarios
app.post("/register", async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).json({ error: "Faltan campos" });

    const users = JSON.parse(await fs.readFile(usersFile));
    if (users.find(u => u.username === username)) return res.status(400).json({ error: "Usuario ya existe" });

    const hashed = await bcrypt.hash(password, 8);
    users.push({ username, password: hashed, role });
    await fs.writeFile(usersFile, JSON.stringify(users, null, 2));

    res.status(201).json({ message: "Usuario registrado" });
});

// Login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(await fs.readFile(usersFile));
    const user = users.find(u => u.username === username);

    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });
    const passOk = await bcrypt.compare(password, user.password);
    if (!passOk) return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ username: user.username, role: user.role }, "clave_secreta", { expiresIn: "2h" });
    res.json({ token });
});

// Obtener tareas
app.get("/tareas", verificarTokenMiddleware, async (req, res) => {
    const tareas = JSON.parse(await fs.readFile(tareasFile));
    res.json(tareas);
});

// Crear tarea (solo admin)
app.post("/tareas", verificarTokenMiddleware, async (req, res) => {
    const { nombre, asignadoA, fechaLimite } = req.body;
    if (req.user.role !== "admin") return res.status(403).json({ error: "Solo admin puede crear tareas" });
    if (!nombre || !asignadoA) return res.status(400).json({ error: "Faltan campos" });

    const nuevaTarea = {
        id: Date.now(),
        nombre,
        estado: "Pendiente",
        fechaCreacion: new Date(),
        fechaLimite: fechaLimite || null,
        creadoPor: req.user.username,
        asignadoA
    };

    const tareas = JSON.parse(await fs.readFile(tareasFile));
    tareas.push(nuevaTarea);
    await fs.writeFile(tareasFile, JSON.stringify(tareas, null, 2));

    res.status(201).json(nuevaTarea);
});

// Editar tarea
app.put("/tareas/:id", verificarTokenMiddleware, async (req, res) => {
    const { id } = req.params;
    const { nombre, estado } = req.body;
    const tareas = JSON.parse(await fs.readFile(tareasFile));
    const tarea = tareas.find(t => t.id == id);
    if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });

    if (nombre && req.user.role === "admin") tarea.nombre = nombre;
    if (estado) tarea.estado = estado;

    await fs.writeFile(tareasFile, JSON.stringify(tareas, null, 2));
    res.json(tarea);
});

// Eliminar tarea
app.delete("/tareas/:id", verificarTokenMiddleware, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Solo admin puede eliminar" });

    const { id } = req.params;
    let tareas = JSON.parse(await fs.readFile(tareasFile));
    tareas = tareas.filter(t => t.id != id);

    await fs.writeFile(tareasFile, JSON.stringify(tareas, null, 2));
    res.json({ message: "Tarea eliminada" });
});

// Middleware de error para rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada", ruta: req.path });
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
