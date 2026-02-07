const fs = require("fs").promises;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const SECRET = "mi_clave_secreta";
const FILE = path.join(__dirname, "users.json");

// Registrar usuario
async function registrar({ username, password, role }) {
    const users = JSON.parse(await fs.readFile(FILE));
    if (users.find(u => u.username === username)) throw new Error("Usuario ya existe");

    const hashed = await bcrypt.hash(password, 10);
    users.push({ username, password: hashed, role });
    await fs.writeFile(FILE, JSON.stringify(users, null, 2));
    return { username, role };
}

// Login usuario
async function login({ username, password }) {
    const users = JSON.parse(await fs.readFile(FILE));
    const user = users.find(u => u.username === username);
    if (!user) throw new Error("Usuario no encontrado");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Contraseña incorrecta");

    const token = jwt.sign({ username, role: user.role }, SECRET, { expiresIn: "1h" });
    return { token, username: user.username, role: user.role };
}

// Verificar token
function verificarToken(token) {
    return jwt.verify(token, SECRET);
}

module.exports = { registrar, login, verificarToken };
