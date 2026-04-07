const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema({
  paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true },
  medico: { type: mongoose.Schema.Types.ObjectId, ref: 'Medico', required: true },
  fecha: { type: Date, required: true },
  hora: { type: String, required: true },
  motivo: { type: String, required: true },
  estado: { 
    type: String, 
    enum: ['pendiente', 'confirmada', 'cancelada', 'completada'], 
    default: 'pendiente' 
  },
  notas: { type: String, default: '' },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { timestamps: true });

module.exports = mongoose.model('Cita', citaSchema);