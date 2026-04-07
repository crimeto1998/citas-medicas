const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const proteger = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'No autorizado, token requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = await Usuario.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

const soloAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado, solo administradores' });
  }
};

module.exports = { proteger, soloAdmin };