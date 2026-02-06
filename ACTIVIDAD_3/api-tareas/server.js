// server.js

// Importar módulos
const express = require('express');
const bodyParser = require('body-parser');

// Inicializar la aplicación
const app = express();
const PORT = 3000;

// Middleware para procesar JSON
app.use(bodyParser.json());

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Servidor Express funcionando correctamente!');
});

// Ejemplo de manejo de rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
    console.error(err.stack); // Muestra el error en la consola
    res.status(500).json({ error: 'Ocurrió un error en el servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
