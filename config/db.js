import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[Base de Datos] ¡Conectado exitosamente a MongoDB Atlas! 🗄️`);
  } catch (error) {
    console.error(`[Error de Conexión]: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;