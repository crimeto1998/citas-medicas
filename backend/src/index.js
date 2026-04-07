 const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/pacientes', require('./routes/paciente.routes'));
app.use('/api/medicos', require('./routes/medico.routes'));
app.use('/api/citas', require('./routes/cita.routes'));

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
