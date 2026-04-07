const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  fechaNacimiento: { type: Date, required: true },
  documento: { type: String, required: true, unique: true },
  historialMedico: { type: String, default: '' },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { timestamps: true });

module.exports = mongoose.model('Paciente', pacienteSchema);