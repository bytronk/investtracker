// Representa un usuario en el sistema
export interface User {
  id: string; // ID único del usuario
  email: string; // Correo electrónico del usuario
  password?: string; // Contraseña (opcional para evitar almacenar en ciertos contextos)
}

// Representa un activo en la cartera
export interface Asset {
  id: string; // ID único del activo
  symbol: string; // Símbolo del activo (por ejemplo, BTC para Bitcoin)
  type: "crypto" | "stock"; // Tipo de activo: cripto o acción
  totalInvested: number; // Total invertido en este activo
}

// Representa una transacción relacionada con activos o cuenta remunerada
export interface Transaction {
  id: string; // ID único de la transacción
  date: string; // Fecha de la transacción en formato ISO (YYYY-MM-DD)
  type: "ingreso" | "interes" | "dividendo" | "venta" | "retiro" | "compra"; // Tipo de transacción
  amount: number; // Monto de la transacción
  assetId?: string; // ID del activo relacionado (opcional para transacciones generales)
}

// Representa el portafolio completo del usuario
export interface Portfolio {
  assets: Asset[]; // Lista de activos en la cartera
  transactions: Transaction[]; // Historial de transacciones
  savingsAccount: number; // Saldo total en la cuenta remunerada
}
