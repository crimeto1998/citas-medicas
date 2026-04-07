const express = require('express');
const router = express.Router();
const {
  obtenerMedicos,
  obtenerMedico,
  crearMedico,
  actualizarMedico,
  eliminarMedico
} = require('../controllers/medico.controller');
const { proteger, soloAdmin } = require('../middlewares/auth.middleware');

router.use(proteger);

router.get('/', obtenerMedicos);
router.get('/:id', obtenerMedico);
router.post('/', soloAdmin, crearMedico);
router.put('/:id', soloAdmin, actualizarMedico);
router.delete('/:id', soloAdmin, eliminarMedico);

module.exports = router;