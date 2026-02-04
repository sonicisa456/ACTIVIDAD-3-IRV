// Usamos la versión asíncrona de fs
const fs = require("fs").promises;

// Ruta al archivo de tareas
const FILE_PATH = "./data/tareas.json";

// Leer tareas
async function leerTareas() {
    try {
        const data = await fs.readFile(FILE_PATH, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        // Si el archivo no existe o está vacío
        if (error.code === "ENOENT") {
            return [];
        }
        throw error;
    }
}

// Guardar tareas
async function guardarTareas(tareas) {
    await fs.writeFile(FILE_PATH, JSON.stringify(tareas, null, 2));
}

module.exports = {
    leerTareas,
    guardarTareas
};
