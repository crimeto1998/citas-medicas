const Medico = require('../models/Medico');
const { z } = require('zod');

const medicoSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  especialidad: z.string().min(3),
  email: z.string().email(),
  telefono: z.string().min(7),
  disponibilidad: z.array(z.object({
    dia: z.enum(['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']),
    horaInicio: z.string(),
    horaFin: z.string()
  })).optional()
});

const obtenerMedicos = async (req, res) => {
  try {
    const medicos = await Medico.find().sort({ createdAt: -1 });
    res.json(medicos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const obtenerMedico = async (req, res) => {
  try {
    const medico = await Medico.findById(req.params.id);
    if (!medico) return res.status(404).json({ message: 'Médico no encontrado' });
    res.json(medico);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const crearMedico = async (req, res) => {
  try {
    const datos = medicoSchema.parse(req.body);
    const medico = await Medico.create(datos);
    res.status(201).json(medico);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const actualizarMedico = async (req, res) => {
  try {
    const medico = await Medico.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!medico) return res.status(404).json({ message: 'Médico no encontrado' });
    res.json(medico);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const eliminarMedico = async (req, res) => {
  try {
    const medico = await Medico.findByIdAndDelete(req.params.id);
    if (!medico) return res.status(404).json({ message: 'Médico no encontrado' });
    res.json({ message: 'Médico eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { obtenerMedicos, obtenerMedico, crearMedico, actualizarMedico, eliminarMedico };