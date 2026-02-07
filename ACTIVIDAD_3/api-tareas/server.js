const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;
const SECRET = "CLAVE_SUPER_SECRETA";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const USERS_FILE = path.join(__dirname, "users.json");
const TASKS_FILE = path.join(__dirname, "tareas.json");

/* ================== UTILIDADES ================== */
async function readJSON(file) {
    try {
        const data = await fs.readFile(file, "utf8");
        return data ? JSON.parse(data) : [];
    } catch (err) {
        if (err.code === "ENOENT") return [];
        throw err;
    }
}

async function writeJSON(file, data) {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
}

/* ================== JWT ================== */
function auth(req, res, next) {
    const header = req.headers["authorization"];
    if (!header) return res.status(401).json({ error: "Token requerido" });

    const token = header.split(" ")[1];
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token inválido" });
        req.user = user;
        next();
    });
}

/* ================== FRONTEND ================== */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "enlaceweb.html"));
});

app.get("/gestor", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "gestor.html"));
});

/* ================== USUARIOS ================== */
app.post("/register", async (req, res, next) => {
    try {
        const { username, password, role } = req.body;

        const users = await readJSON(USERS_FILE);
        if (users.find(u => u.username === username))
            return res.status(400).json({ error: "Usuario ya existe" });

        const hashed = await bcrypt.hash(password, 10);

        users.push({
            username,
            password: hashed,
            role: role || "user"
        });

        await writeJSON(USERS_FILE, users);
        res.json({ message: "Usuario registrado" });
    } catch (err) {
        next(err);
    }
});

app.post("/login", async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const users = await readJSON(USERS_FILE);
        const user = users.find(u => u.username === username);

        if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: "Contraseña incorrecta" });

        const token = jwt.sign(
            { username: user.username, role: user.role },
            SECRET,
            { expiresIn: "2h" }
        );

        res.json({ token });
    } catch (err) {
        next(err);
    }
});

/* ================== TAREAS ================== */
app.get("/tareas", auth, async (req, res, next) => {
    try {
        const tareas = await readJSON(TASKS_FILE);
        const visibles = tareas.filter(t =>
            t.asignadoA === req.user.username || t.creadoPor === req.user.username
        );
        res.json(visibles);
    } catch (err) {
        next(err);
    }
});

app.post("/tareas", auth, async (req, res, next) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({ error: "Solo admin puede crear tareas" });

        const { nombre, fechaLimite, asignadoA } = req.body;
        if (!nombre || !fechaLimite || !asignadoA)
            return res.status(400).json({ error: "Datos incompletos" });

        const users = await readJSON(USERS_FILE);
        if (!users.find(u => u.username === asignadoA))
            return res.status(400).json({ error: "Usuario asignado no existe" });

        const tareas = await readJSON(TASKS_FILE);

        const nueva = {
            id: Date.now(),
            nombre,
            estatus: "Pendiente",
            fechaCreacion: new Date().toISOString().split("T")[0],
            fechaLimite,
            creadoPor: req.user.username,
            asignadoA
        };

        tareas.push(nueva);
        await writeJSON(TASKS_FILE, tareas);
        res.json(nueva);
    } catch (err) {
        next(err);
    }
});

app.put("/tareas/:id", auth, async (req, res, next) => {
    try {
        const tareas = await readJSON(TASKS_FILE);
        const tarea = tareas.find(t => t.id == req.params.id);
        if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });

        // Usuario normal solo puede cambiar estatus de SU tarea
        if (req.user.role === "user") {
            if (tarea.asignadoA !== req.user.username)
                return res.status(403).json({ error: "No es tu tarea" });

            if (!req.body.estatus)
                return res.status(403).json({ error: "Solo puedes cambiar estatus" });

            tarea.estatus = req.body.estatus;
            await writeJSON(TASKS_FILE, tareas);
            return res.json(tarea);
        }

        // Admin puede editar todo
        const { nombre, fechaLimite, asignadoA, estatus } = req.body;
        if (nombre) tarea.nombre = nombre;
        if (fechaLimite) tarea.fechaLimite = fechaLimite;
        if (asignadoA) tarea.asignadoA = asignadoA;
        if (estatus) tarea.estatus = estatus;

        await writeJSON(TASKS_FILE, tareas);
        res.json(tarea);
    } catch (err) {
        next(err);
    }
});

app.delete("/tareas/:id", auth, async (req, res, next) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({ error: "Solo admin puede borrar" });

        const tareas = await readJSON(TASKS_FILE);
        const nuevas = tareas.filter(t => t.id != req.params.id);

        if (tareas.length === nuevas.length)
            return res.status(404).json({ error: "Tarea no encontrada" });

        await writeJSON(TASKS_FILE, nuevas);
        res.json({ message: "Tarea eliminada" });
    } catch (err) {
        next(err);
    }
});

/* ================== ERRORES ================== */
app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada", ruta: req.originalUrl });
});

app.use((err, req, res, next) => {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Error interno", mensaje: err.message });
});

/* ================== SERVER ================== */
app.listen(PORT, () => {
    console.log("Servidor corriendo en http://localhost:" + PORT);
});
