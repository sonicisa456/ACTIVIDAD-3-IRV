const fs = require("fs").promises;
const path = require("path");

const FILE = path.join(__dirname, "tareas.json");

// Obtener tareas visibles para el usuario
async function obtener(user) {
    const tareas = JSON.parse(await fs.readFile(FILE));
    if (user.role === "admin") return tareas;
    return tareas.filter(t => t.asignadoA === user.username);
}

// Crear tarea (solo admin)
async function crear(tarea, user) {
    if (user.role !== "admin") throw new Error("No tienes permiso para crear tareas");
    const tareas = JSON.parse(await fs.readFile(FILE));
    const nueva = {
        id: Date.now(),
        nombre: tarea.nombre,
        descripcion: tarea.descripcion || "",
        estatus: "pendiente",
        fechaCreacion: new Date().toISOString().split("T")[0],
        fechaLimite: tarea.fechaLimite || "",
        creadoPor: user.username,
        asignadoA: tarea.asignadoA || ""
    };
    tareas.push(nueva);
    await fs.writeFile(FILE, JSON.stringify(tareas, null, 2));
    return nueva;
}

// Actualizar tarea
async function actualizar(id, body, user) {
    const tareas = JSON.parse(await fs.readFile(FILE));
    const tarea = tareas.find(t => t.id === parseInt(id));
    if (!tarea) throw new Error("Tarea no encontrada");

    // Solo admin puede editar nombre, descripción, fechaLimite, asignadoA
    if (user.role === "admin") {
        tarea.nombre = body.nombre || tarea.nombre;
        tarea.descripcion = body.descripcion || tarea.descripcion;
        tarea.fechaLimite = body.fechaLimite || tarea.fechaLimite;
        tarea.asignadoA = body.asignadoA || tarea.asignadoA;
    }

    // Admin o usuario asignado puede cambiar estatus
    if (body.estatus && (user.role === "admin" || tarea.asignadoA === user.username)) {
        tarea.estatus = body.estatus;
    }

    await fs.writeFile(FILE, JSON.stringify(tareas, null, 2));
    return tarea;
}

// Eliminar tarea (solo admin)
async function eliminar(id, user) {
    if (user.role !== "admin") throw new Error("No tienes permiso para eliminar tareas");
    let tareas = JSON.parse(await fs.readFile(FILE));
    tareas = tareas.filter(t => t.id !== parseInt(id));
    await fs.writeFile(FILE, JSON.stringify(tareas, null, 2));
}

module.exports = { obtener, crear, actualizar, eliminar };
