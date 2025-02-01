const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

// Sobrescribir JSON.stringify para manejar BigInt globalmente
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Leer las URLs permitidas desde .env
const allowedOrigins = process.env.FRONTEND_URL?.split(",");
if (!allowedOrigins || allowedOrigins.length === 0) {
  console.error("Error: FRONTEND_URL no está configurado en el archivo .env.");
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
    credentials: true,
  })
);

// Middleware para parsear JSON en las solicitudes
app.use(bodyParser.json());

// Ruta para registrar un nuevo usuario con su portfolio y savings_account
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

    // Crear nuevo usuario con portfolio asociado y savings_account
    const newUser = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        portfolio: {
          create: {
            name: `Portfolio de ${email}`,
            savings_account: {
              create: { total: 0 },
            },
          },
        },
      },
      include: { portfolio: { include: { savings_account: true } } },
    });

    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      portfolio_id: newUser.portfolio.id,
      savingsAccount: newUser.portfolio.savings_account?.total || 0,
    });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    next(error);
  }
});

// Ruta para iniciar sesión
app.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Correo y contraseña requeridos." });
  }

  try {
    // Buscar usuario en la base de datos junto con su portfolio y savings_account
    const user = await prisma.users.findUnique({
      where: { email },
      include: { portfolio: { include: { savings_account: true } } },
    });

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    // Comparar contraseñas con bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      portfolio_id: user.portfolio.id,
      savingsAccount: user.portfolio.savings_account?.total || 0,
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    next(error);
  }
});

// Nueva Ruta para obtener un portfolio por ID con validación
app.get("/portfolio/:portfolioId", async (req, res) => {
  const { portfolioId } = req.params;

  // Validación: Asegurar que portfolioId sea un número válido
  if (isNaN(portfolioId)) {
    return res.status(400).json({ message: "ID de portfolio inválido." });
  }

  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: BigInt(portfolioId) },
      include: {
        assets: true,
        transactions: true,
        savings_account: true,
      },
    });

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio no encontrado." });
    }

    res.json(portfolio);
  } catch (error) {
    console.error("Error al obtener el portfolio:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Ruta para actualizar el total en savings_account con validación
app.put("/savings_account/:portfolioId", async (req, res) => {
  const { portfolioId } = req.params;
  const { total } = req.body;

  // Validación: Asegurar que portfolioId y total sean válidos
  if (isNaN(portfolioId) || isNaN(total)) {
    return res.status(400).json({ message: "Datos inválidos." });
  }

  try {
    // Verificar si el portfolio existe antes de intentar actualizar
    const existingPortfolio = await prisma.savings_account.findUnique({
      where: { portfolio_id: BigInt(portfolioId) },
    });

    if (!existingPortfolio) {
      return res.status(404).json({ message: "Portfolio no encontrado." });
    }

    const updatedSavingsAccount = await prisma.savings_account.update({
      where: { portfolio_id: BigInt(portfolioId) },
      data: { total },
    });

    res.json(updatedSavingsAccount);
  } catch (error) {
    console.error("Error al actualizar savings_account:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Middleware para manejar errores globales con mejor respuesta JSON
app.use((error, req, res, next) => {
  console.error("Error no controlado:", error);
  res.status(500).json({
    message: "Error interno del servidor.",
    error: error.message || "Error desconocido.",
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
