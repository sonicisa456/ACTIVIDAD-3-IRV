// usuariosService.js
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const archivoUsuarios = path.join(__dirname, 'usuarios.json');

// Obtener todos los usuarios
async function obtenerUsuarios() {
    try {
        const data = await fs.readFile(archivoUsuarios, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') return [];
        throw err;
    }
}

// Guardar todos los usuarios
async function guardarUsuarios(usuarios) {
    await fs.writeFile(archivoUsuarios, JSON.stringify(usuarios, null, 2));
}

// Registrar usuario nuevo (con password encriptada)
async function registrarUsuario(username, password, role = 'user') {
    const usuarios = await obtenerUsuarios();

    // Verificar si ya existe
    if (usuarios.find(u => u.username === username)) return null;

    const hash = await bcrypt.hash(password, 10); // Encriptar contraseña
    const nuevoUsuario = { id: Date.now(), username, password: hash, role };
    usuarios.push(nuevoUsuario);
    await guardarUsuarios(usuarios);
    return nuevoUsuario;
}

// Verificar usuario y contraseña
async function autenticarUsuario(username, password) {
    const usuarios = await obtenerUsuarios();
    const user = usuarios.find(u => u.username === username);
    if (!user) return null;

    const valido = await bcrypt.compare(password, user.password);
    return valido ? user : null;
}

module.exports = {
    obtenerUsuarios,
    registrarUsuario,
    autenticarUsuario
};
