const mongoose = require('mongoose');

const medicoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  especialidad: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  disponibilidad: [{
    dia: { type: String, enum: ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'] },
    horaInicio: String,
    horaFin: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Medico', medicoSchema);