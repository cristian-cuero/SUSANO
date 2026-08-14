import aiService from "../services/groqService.js";
import memoryService from "../services/memoryService.js";
import { obtenerSocket } from "../services/socketService.js";

const emocionesValidas = [
  "neutral",
  "feliz",
  "triste",
  "curioso",
  "pensando",
  "sorprendido",
  "enojado",
  "escuchando",
  "dormido",
];

const accionesValidas = [
  "NINGUNA",
  "EXPLORAR",
  "PARAR",
  "SEGUIR_PERSONA"
];

export const conversar = async (req, res) => {
  try {
    const { mensaje } = req.body;

    const memoria = await memoryService.obtenerMemoria("creador_principal");

    const recuerdos = JSON.stringify(
      Object.fromEntries(memoria.usuario.datosClave)
    );

    const socket =  obtenerSocket();

    const respuestaIA = await aiService.preguntar(recuerdos, mensaje, socket);

    if (
      respuestaIA.nuevosRecuerdos &&
      Object.keys(respuestaIA.nuevosRecuerdos).length > 0
    ) {
      await memoryService.guardarRecuerdos(
        memoria,
        respuestaIA.nuevosRecuerdos
      );
    }

    if (!emocionesValidas.includes(respuestaIA.emocion)) {
      respuestaIA.emocion = "neutral";
    }
    if (!accionesValidas.includes(respuestaIA.accion)) {
      respuestaIA.accion = "NINGUNA";
    }

    return res.json({
      success: true,
      respuesta: respuestaIA.respuesta,
      emocion: respuestaIA.emocion,
      accion: respuestaIA.accion,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};