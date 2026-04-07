const express = require('express');
const router = express.Router();
const {
  obtenerCitas,
  obtenerCita,
  crearCita,
  actualizarEstado,
  eliminarCita
} = require('../controllers/cita.controller');
const { proteger, soloAdmin } = require('../middlewares/auth.middleware');

router.use(proteger);

router.get('/', obtenerCitas);
router.get('/:id', obtenerCita);
router.post('/', crearCita);
router.patch('/:id/estado', actualizarEstado);
router.delete('/:id', soloAdmin, eliminarCita);

module.exports = router;