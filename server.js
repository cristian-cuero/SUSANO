import "dotenv/config"; //
import express from "express";
import http from "http"; // 1. Módulo nativo para crear el servidor
import { WebSocketServer } from "ws"; // 2. Servidor de WebSockets
import connectDB from "./config/db.js";
import aiRoutes from "./routes/aiRoutes.js";
import { guardarSocket, limpiarSocket } from "./services/socketService.js";

const app = express();

app.use(express.json());

// Conexión a la base de datos
connectDB();

// Rutas de la IA
app.use("/api/ai", aiRoutes);

// Ruta de prueba rápida
app.get("/", (req, res) => {
  res.send("El sistema nervioso de Susano está encendido y listo. 🤖");
});

// --- 3. CREAMOS EL SERVIDOR HTTP Y CONECTAMOS WEBSOCKETS ---
const server = http.createServer(app);

const wss = new WebSocketServer({
  server,
});

wss.on("connection", (ws) => {
  console.log("⚡ ¡Susano detectó un nuevo cliente WebSocket conectado!");
  guardarSocket(ws);
  ws.on("close", () => {
    limpiarSocket(ws);
  });
});

// --- 4. CAMBIO CLAVE: Escuchamos en 'server', no en 'app' ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Servidor] Corriendo en http://localhost:${PORT} 🚀`);
  console.log(`[WebSocket] Listo en ws://localhost:${PORT}`);
});
