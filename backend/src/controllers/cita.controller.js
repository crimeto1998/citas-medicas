const Cita = require('../models/Cita');
const { z } = require('zod');

const citaSchema = z.object({
  paciente: z.string(),
  medico: z.string(),
  fecha: z.string(),
  hora: z.string(),
  motivo: z.string().min(5),
  notas: z.string().optional()
});

const obtenerCitas = async (req, res) => {
  try {
    const citas = await Cita.find()
      .populate('paciente', 'nombre apellido documento')
      .populate('medico', 'nombre apellido especialidad')
      .sort({ fecha: 1 });
    res.json(citas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const obtenerCita = async (req, res) => {
  try {
    const cita = await Cita.findById(req.params.id)
      .populate('paciente', 'nombre apellido documento telefono')
      .populate('medico', 'nombre apellido especialidad');
    if (!cita) return res.status(404).json({ message: 'Cita no encontrada' });
    res.json(cita);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const crearCita = async (req, res) => {
  try {
    const datos = citaSchema.parse(req.body);

    // Validar disponibilidad: no permitir doble reserva
    const citaExiste = await Cita.findOne({
      medico: datos.medico,
      fecha: datos.fecha,
      hora: datos.hora,
      estado: { $in: ['pendiente', 'confirmada'] }
    });

    if (citaExiste) {
      return res.status(400).json({ message: 'El médico ya tiene una cita en ese horario' });
    }

    const cita = await Cita.create({ ...datos, creadoPor: req.usuario._id });
    res.status(201).json(cita);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const actualizarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const cita = await Cita.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );
    if (!cita) return res.status(404).json({ message: 'Cita no encontrada' });
    res.json(cita);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const eliminarCita = async (req, res) => {
  try {
    const cita = await Cita.findByIdAndDelete(req.params.id);
    if (!cita) return res.status(404).json({ message: 'Cita no encontrada' });
    res.json({ message: 'Cita eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { obtenerCitas, obtenerCita, crearCita, actualizarEstado, eliminarCita };