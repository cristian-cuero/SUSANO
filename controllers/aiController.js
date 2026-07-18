const aiService = require("../services/groqService");
const memoryService = require("../services/memoryService");

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


exports.conversar = async (req, res) => {
  try {
    const { mensaje } = req.body;

    const memoria = await memoryService.obtenerMemoria("creador_principal");

    const recuerdos = JSON.stringify(
      Object.fromEntries(memoria.usuario.datosClave),
    );

    const respuestaIA = await aiService.preguntar(recuerdos, mensaje);

    if (
      respuestaIA.nuevosRecuerdos &&
      Object.keys(respuestaIA.nuevosRecuerdos).length > 0
    ) {
      await memoryService.guardarRecuerdos(
        memoria,
        respuestaIA.nuevosRecuerdos,
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
