const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Intentamos conectarnos usando la URI del archivo .env
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[Base de Datos] ¡Conectado exitosamente a MongoDB Atlas! 🗄️`);
  } catch (error) {
    console.error(`[Error de Conexión]: ${error.message}`);
    process.exit(1); // Si falla, apaga el servidor para no trabajar a ciegas
  }
};

module.exports = connectDB;