import mongoose from 'mongoose';

const SusanoMemorySchema = new mongoose.Schema({
  userId: { 
    type: String, 
    default: 'creador_principal', 
    unique: true 
  },
  usuario: {
    nombre: { type: String, default: 'Creador' },
    datosClave: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }
}, { timestamps: true });

export default mongoose.model('SusanoMemory', SusanoMemorySchema);