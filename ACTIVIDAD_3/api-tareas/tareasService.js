// tareasService.js
const fs = require('fs').promises;
const path = require('path');

const archivoTareas = path.join(__dirname, 'tareas.json');

// Leer todas las tareas
async function obtenerTareas() {
    try {
        const data = await fs.readFile(archivoTareas, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            // Si el archivo no existe, retornar array vacío
            return [];
        }
        throw err;
    }
}

// Guardar todas las tareas
async function guardarTareas(tareas) {
    await fs.writeFile(archivoTareas, JSON.stringify(tareas, null, 2));
}

// Agregar una tarea
async function agregarTarea(tarea) {
    const tareas = await obtenerTareas();
    tareas.push(tarea);
    await guardarTareas(tareas);
    return tarea;
}

// Actualizar una tarea por ID
async function actualizarTarea(id, nuevosDatos) {
    const tareas = await obtenerTareas();
    const index = tareas.findIndex(t => t.id === id);
    if (index === -1) return null;

    tareas[index] = { ...tareas[index], ...nuevosDatos };
    await guardarTareas(tareas);
    return tareas[index];
}

// Eliminar tarea por ID
async function eliminarTarea(id) {
    const tareas = await obtenerTareas();
    const index = tareas.findIndex(t => t.id === id);
    if (index === -1) return null;

    const eliminada = tareas.splice(index, 1)[0];
    await guardarTareas(tareas);
    return eliminada;
}

module.exports = {
    obtenerTareas,
    agregarTarea,
    actualizarTarea,
    eliminarTarea
};
