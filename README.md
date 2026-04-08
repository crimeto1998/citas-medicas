# 🏥 Sistema de Gestión de Citas Médicas

Aplicación web fullstack para la gestión de citas médicas, pacientes y médicos.
Desarrollada con Vue.js 3, Node.js, Express y MongoDB.

---

## 🚀 Tecnologías utilizadas

- **Frontend:** Vue.js 3, Pinia, Vue Router, Axios
- **Backend:** Node.js, Express, JWT, Bcrypt, Zod
- **Base de datos:** MongoDB

---

## ⚙️ Instalación y configuración

### Requisitos previos
- Node.js v20 o superior
- MongoDB instalado y corriendo

### 1. Clonar el repositorio
```bash
git clone https://github.com/crimeto1998/citas-medicas.git
cd citas-medicas
```

### 2. Configurar el Backend
```bash
cd backend
npm install
```
Edita el archivo `.env`:




Inicia el servidor:
```bash
npm run dev
```
✅ El backend corre en `http://localhost:3000`

### 3. Configurar el Frontend
Abre una nueva terminal:
```bash
cd frontend
npm install
npm run dev
```
✅ El frontend corre en `http://localhost:5173`

---

## 👤 Roles del sistema

| Rol | Permisos |
|-----|----------|
| **Admin** | Crear, editar y eliminar pacientes, médicos y citas |
| **Usuario** | Ver y crear pacientes y citas. No puede eliminar |

---

## 📖 Guía de uso

### 1. Registro e inicio de sesión

Al ingresar a `http://localhost:5173` el sistema redirige automáticamente al login.

**Crear cuenta admin:**
- Clic en **"Regístrate"**
- Completa nombre, email y contraseña
- ⚠️ El rol admin solo se puede asignar desde la API directamente

**Iniciar sesión:**
- Ingresa tu email y contraseña
- Clic en **"Ingresar"**
- El sistema redirige al Dashboard automáticamente

---

### 2. Dashboard

Muestra un resumen general del sistema con 4 tarjetas:
- **Pacientes:** Total de pacientes registrados
- **Médicos:** Total de médicos registrados
- **Citas Pendientes:** Citas en estado pendiente
- **Citas Hoy:** Citas programadas para el día actual

---

### 3. Gestión de Pacientes

#### ➕ Agregar paciente
1. Clic en **"👥 Pacientes"** en el menú lateral
2. Clic en el botón **"+ Nuevo Paciente"**
3. Completa el formulario:
   - Nombre y Apellido
   - Documento de identidad
   - Teléfono
   - Email
   - Fecha de nacimiento
   - Historial médico (opcional)
4. Clic en **"Guardar"**

#### ✏️ Editar paciente
1. En la tabla busca el paciente
2. Clic en el botón **✏️** de la fila
3. Modifica los datos necesarios
4. Clic en **"Actualizar"**

#### 🗑️ Eliminar paciente
1. Solo disponible para usuarios **Admin**
2. Clic en el botón **🗑️** de la fila
3. Confirma la acción en el diálogo

#### 🔍 Buscar paciente
- Usa la barra de búsqueda para filtrar por nombre, apellido o documento

---

### 4. Gestión de Médicos

#### ➕ Agregar médico
1. Clic en **"👨‍⚕️ Médicos"** en el menú lateral
2. Clic en **"+ Nuevo Médico"** (solo Admin)
3. Completa el formulario:
   - Nombre y Apellido
   - Especialidad
   - Email
   - Teléfono
4. Clic en **"Guardar"**

#### ✏️ Editar médico
1. Clic en el botón **✏️** de la fila (solo Admin)
2. Modifica los datos
3. Clic en **"Actualizar"**

#### 🗑️ Eliminar médico
1. Solo disponible para **Admin**
2. Clic en **🗑️** y confirma

#### 🔍 Buscar médico
- Filtra por nombre, apellido o especialidad

---

### 5. Gestión de Citas

#### ➕ Agendar nueva cita
1. Clic en **"📅 Citas"** en el menú lateral
2. Clic en **"+ Nueva Cita"**
3. Completa el formulario:
   - **Paciente:** Selecciona de la lista
   - **Médico:** Selecciona de la lista
   - **Fecha:** Selecciona la fecha
   - **Hora:** Selecciona la hora
   - **Motivo:** Describe el motivo de la consulta
   - **Notas:** Información adicional (opcional)
4. Clic en **"Guardar"**
5. ⚠️ El sistema valida automáticamente que el médico no tenga otra cita en el mismo horario

#### 🔄 Cambiar estado de una cita
Cada cita puede tener 4 estados:
| Estado | Color | Descripción |
|--------|-------|-------------|
| 🟡 Pendiente | Amarillo | Cita recién agendada |
| 🟢 Confirmada | Verde | Cita confirmada por el médico |
| 🔴 Cancelada | Rojo | Cita cancelada |
| 🔵 Completada | Azul | Consulta realizada |

Para cambiar el estado:
1. En la columna **"Estado"** de la tabla
2. Clic en el selector desplegable de la cita
3. Selecciona el nuevo estado
4. Se actualiza automáticamente

#### 🗑️ Eliminar cita
1. Solo disponible para **Admin**
2. Clic en **🗑️** y confirma

#### 🔍 Buscar cita
- Filtra por nombre del paciente, médico o motivo

---

## 🔐 Seguridad implementada

- Contraseñas cifradas con **bcrypt**
- Autenticación mediante **JWT** (expira en 24h)
- Rutas protegidas con **middlewares** en el backend
- **Navigation Guards** en el frontend
- Validación de datos con **Zod**
- Prevención de doble reserva de citas

---

## 📡 Endpoints de la API

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| POST | /api/auth/registro | Registrar usuario | Público |
| POST | /api/auth/login | Iniciar sesión | Público |
| GET | /api/auth/perfil | Ver perfil | Autenticado |
| GET | /api/pacientes | Listar pacientes | Autenticado |
| POST | /api/pacientes | Crear paciente | Autenticado |
| PUT | /api/pacientes/:id | Editar paciente | Autenticado |
| DELETE | /api/pacientes/:id | Eliminar paciente | Admin |
| GET | /api/medicos | Listar médicos | Autenticado |
| POST | /api/medicos | Crear médico | Admin |
| PUT | /api/medicos/:id | Editar médico | Admin |
| DELETE | /api/medicos/:id | Eliminar médico | Admin |
| GET | /api/citas | Listar citas | Autenticado |
| POST | /api/citas | Crear cita | Autenticado |
| PATCH | /api/citas/:id/estado | Cambiar estado | Autenticado |
| DELETE | /api/citas/:id | Eliminar cita | Admin |

---

## 👨‍💻 Christian Andres Mejia Torres

Desarrollado como proyecto académico para el curso de Desarrollo orientado a la Web.