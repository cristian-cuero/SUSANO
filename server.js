const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const aiRoutes = require('./routes/aiRoutes'); // 1. Importamos las rutas de la IA


const app = express();

app.use(express.json());

// Conexión a la base de datos
connectDB();

// 2. Enlazamos la ruta de la IA al prefijo '/api/ai'
app.use('/api/ai', aiRoutes);

// Ruta de prueba rápida en el navegador
app.get('/', (req, res) => {
  res.send('El sistema nervioso de Susano está encendido y listo.');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Servidor] Corriendo en http://localhost:${PORT} 🚀`);
});