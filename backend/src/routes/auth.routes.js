const express = require('express');
const router = express.Router();
const { registrar, login, perfil } = require('../controllers/auth.controller');
const { proteger } = require('../middlewares/auth.middleware');

router.post('/registro', registrar);
router.post('/login', login);
router.get('/perfil', proteger, perfil);

module.exports = router;