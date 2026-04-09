const Cita = require('../models/Cita');
const { z } = require('zod');

const citaSchema = z.object({
  paciente: z.string(),
  medico: z.string(),
  fecha: z.string(),
  hora: z.string(),
  duracion: z.number().min(1).max(8),
  motivo: z.string().min(5),
  notas: z.string().optional()
});

// Convierte "07:00" + duracion en "10:00"
function calcularHoraFin(hora, duracion) {
  const [h, m] = hora.split(':').map(Number);
  const totalMinutos = h * 60 + m + duracion * 60;
  const hFin = Math.floor(totalMinutos / 60) % 24;
  const mFin = totalMinutos % 60;
  return `${String(hFin).padStart(2, '0')}:${String(mFin).padStart(2, '0')}`;
}

// Verifica si dos rangos de tiempo se solapan
function hayConflicto(horaA, horaFinA, horaB, horaFinB) {
  const toMin = (h) => { const [hh, mm] = h.split(':').map(Number); return hh * 60 + mm; };
  return toMin(horaA) < toMin(horaFinB) && toMin(horaFinA) > toMin(horaB);
}

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

const obtenerDisponibilidad = async (req, res) => {
  try {
    const { medicoId, fecha } = req.query;
    if (!medicoId || !fecha) {
      return res.status(400).json({ message: 'medicoId y fecha son requeridos' });
    }

    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    const citas = await Cita.find({
      medico: medicoId,
      fecha: { $gte: fechaInicio, $lte: fechaFin },
      estado: { $in: ['pendiente', 'confirmada'] }
    }).populate('paciente', 'nombre apellido');

    res.json(citas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const crearCita = async (req, res) => {
  try {
    const datos = citaSchema.parse(req.body);
    const horaFin = calcularHoraFin(datos.hora, datos.duracion);

    // Buscar citas del mismo médico en la misma fecha
    const fechaInicio = new Date(datos.fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(datos.fecha);
    fechaFin.setHours(23, 59, 59, 999);

    const citasExistentes = await Cita.find({
      medico: datos.medico,
      fecha: { $gte: fechaInicio, $lte: fechaFin },
      estado: { $in: ['pendiente', 'confirmada'] }
    });

    // Verificar conflicto de horario
    for (const cita of citasExistentes) {
      if (hayConflicto(datos.hora, horaFin, cita.hora, cita.horaFin)) {
        return res.status(400).json({
          message: `Conflicto de horario: el médico tiene una cita de ${cita.hora} a ${cita.horaFin}`
        });
      }
    }

    const cita = await Cita.create({
      ...datos,
      horaFin,
      creadoPor: req.usuario._id
    });
    res.status(201).json(cita);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const actualizarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const cita = await Cita.findByIdAndUpdate(req.params.id, { estado }, { new: true });
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

module.exports = { obtenerCitas, obtenerCita, crearCita, actualizarEstado, eliminarCita, obtenerDisponibilidad };