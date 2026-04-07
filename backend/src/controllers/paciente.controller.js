const Paciente = require('../models/Paciente');
const { z } = require('zod');

const pacienteSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().min(7),
  fechaNacimiento: z.string(),
  documento: z.string().min(5),
  historialMedico: z.string().optional()
});

const obtenerPacientes = async (req, res) => {
  try {
    const pacientes = await Paciente.find().sort({ createdAt: -1 });
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const obtenerPaciente = async (req, res) => {
  try {
    const paciente = await Paciente.findById(req.params.id);
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' });
    res.json(paciente);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const crearPaciente = async (req, res) => {
  try {
    const datos = pacienteSchema.parse(req.body);
    const paciente = await Paciente.create({ ...datos, creadoPor: req.usuario._id });
    res.status(201).json(paciente);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const actualizarPaciente = async (req, res) => {
  try {
    const paciente = await Paciente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' });
    res.json(paciente);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const eliminarPaciente = async (req, res) => {
  try {
    const paciente = await Paciente.findByIdAndDelete(req.params.id);
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' });
    res.json({ message: 'Paciente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { obtenerPacientes, obtenerPaciente, crearPaciente, actualizarPaciente, eliminarPaciente };