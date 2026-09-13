import "dotenv/config";

import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import {
    configurarCuerpo,
    manejarDesconexionCuerpo
} from "./services/cuerpo/cuerpoService.js";

import connectDB from "./config/db.js";

import aiRoutes from "./routes/aiRoutes.js";

import { guardarSocket, limpiarSocket } from "./services/socketService.js";

import { conversarWebSocket } from "./controllers/aiController.js";

const app = express();

app.use(express.json());

// ========================================
// CONEXIÓN A LA BASE DE DATOS
// ========================================

connectDB();

// ========================================
// RUTAS DE LA IA
// ========================================

app.use("/api/ai", aiRoutes);

// ========================================
// RUTA DE PRUEBA
// ========================================

app.get("/", (req, res) => {
  res.send("El sistema nervioso de Susano está encendido y listo. 🤖");
});

// ========================================
// SERVIDOR HTTP
// ========================================

const server = http.createServer(app);

// ========================================
// WEBSOCKET
// ========================================

const wss = new WebSocketServer({
  server,
});

// ========================================
// CLIENTES CONECTADOS
// ========================================

wss.on("connection", (ws) => {

    console.log(
        "⚡ ¡Susano detectó un nuevo cliente WebSocket conectado!"
    );

    configurarCuerpo(ws);

    guardarSocket(ws);

    ws.on("close", () => {

        manejarDesconexionCuerpo(ws);

        limpiarSocket(ws);
    });
});

// ========================================
// PUERTO
// ========================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[Servidor] Corriendo en http://localhost:${PORT} 🚀`);

  console.log(`[WebSocket] Listo en ws://localhost:${PORT}`);
});
