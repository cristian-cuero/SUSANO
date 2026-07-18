const mongoose = require('mongoose');

const SusanoMemorySchema = new mongoose.Schema({
  userId: { 
    type: String, 
    default: 'creador_principal', 
    unique: true 
  },
  usuario: {
    nombre: { type: String, default: 'Creador' },
    datosClave: {
      type: Map, // <--- Esto permite guardar cualquier tipo de dato dinámico
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }
}, { timestamps: true }); // Guarda automáticamente la fecha de creación y actualización

module.exports = mongoose.model('SusanoMemory', SusanoMemorySchema);