const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const registroSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  rol: z.enum(['admin', 'usuario']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const registrar = async (req, res) => {
  try {
    const datos = registroSchema.parse(req.body);
    const usuarioExiste = await Usuario.findOne({ email: datos.email });
    if (usuarioExiste) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(datos.password, salt);
    const usuario = await Usuario.create({ ...datos, password: passwordHash });
    res.status(201).json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      token: generarToken(usuario._id)
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const datos = loginSchema.parse(req.body);
    const usuario = await Usuario.findOne({ email: datos.email });
    if (!usuario || !(await bcrypt.compare(datos.password, usuario.password))) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      token: generarToken(usuario._id)
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const perfil = async (req, res) => {
  res.json(req.usuario);
};

module.exports = { registrar, login, perfil };