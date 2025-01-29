const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt"); // Para el hash de contraseñas
require("dotenv").config(); // Cargar variables de entorno

const app = express();
const prisma = new PrismaClient();

// Sobrescribir JSON.stringify para manejar BigInt globalmente
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Leer las URLs permitidas desde .env
const allowedOrigins = process.env.FRONTEND_URL?.split(",");
if (!allowedOrigins || allowedOrigins.length === 0) {
  console.error(
    "Error: FRONTEND_URL no está configurado correctamente en el archivo .env."
  );
  process.exit(1);
}

// Middleware de CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`CORS error: Origin not allowed - ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Para permitir cookies y credenciales
  })
);

// Middleware para parsear JSON en las solicitudes
app.use(bodyParser.json());

// Ruta para registrar un nuevo usuario
app.post("/register", async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Correo y contraseña requeridos." });
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "El correo ya está registrado." });
    }

    // Hash de la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = await prisma.users.create({
      data: { email, password: hashedPassword },
    });

    res.status(201).json({ id: newUser.id, email: newUser.email });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    next(error); // Pasar el error al middleware de manejo de errores
  }
});

// Ruta para iniciar sesión
app.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Correo y contraseña requeridos." });
  }

  try {
    // Buscar usuario en la base de datos
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    // Comparar contraseñas con bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    res.status(200).json({ id: user.id, email: user.email });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    next(error); // Pasar el error al middleware de manejo de errores
  }
});

// Middleware para manejar errores globales
app.use((error, req, res, next) => {
  console.error("Error no controlado:", error.message || error);
  res.status(500).json({ message: "Error interno del servidor." });
});

// Iniciar servidor
const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
