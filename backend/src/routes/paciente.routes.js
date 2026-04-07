const express = require('express');
const router = express.Router();
const {
  obtenerPacientes,
  obtenerPaciente,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente
} = require('../controllers/paciente.controller');
const { proteger, soloAdmin } = require('../middlewares/auth.middleware');

router.use(proteger);

router.get('/', obtenerPacientes);
router.get('/:id', obtenerPaciente);
router.post('/', crearPaciente);
router.put('/:id', actualizarPaciente);
router.delete('/:id', soloAdmin, eliminarPaciente);

module.exports = router;