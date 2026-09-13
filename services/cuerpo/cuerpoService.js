// ========================================
// SERVICIO DEL CUERPO DE SUSANO
// ========================================


import {
    iniciarAudio,
    recibirAudio,
    finalizarAudio
} from "../../helper/cuerpo/audioHelper.js";
import { transcribirAudio } from "../ia/transcriptionService.js";
import { preguntar} from "../groqService.js";
// ========================================
// CONFIGURAR CUERPO
// ========================================

export function configurarCuerpo(ws) {

    // ====================================
    // ESTADO DEL CUERPO
    // ====================================

    ws.dispositivo = null;

    iniciarAudio(ws);

    // ====================================
    // AUDIO
    // ====================================

    ws.audioChunks = [];
    ws.audioBytes = 0;

    // ====================================
    // MENSAJES
    // ====================================

    ws.on("message", async (mensaje, isBinary) => {

        // ==================================
        // AUDIO PCM
        // ==================================

        if (isBinary) {

            if (ws.dispositivo === "cuerpo") {

                recibirAudio(ws, mensaje);

            } else {

                console.log(
                    "⚠️ Audio recibido de un dispositivo no identificado"
                );
            }

            return;
        }

        // ==================================
        // MENSAJE DE TEXTO
        // ==================================

        const texto = mensaje.toString();

        // ==================================
        // IDENTIFICACIÓN
        // ==================================

        try {

            const datos = JSON.parse(texto);

            if (datos.tipo === "identificacion") {

                if (
                    datos.dispositivo === "cuerpo" ||
                    datos.dispositivo === "cabeza"
                ) {

                    ws.dispositivo = datos.dispositivo;

                    console.log(
                        `🤖 Dispositivo identificado: ${ws.dispositivo.toUpperCase()}`
                    );

                    ws.send(
                        JSON.stringify({
                            tipo: "identificacion_ok",
                            dispositivo: ws.dispositivo
                        })
                    );

                    return;
                }
            }

        } catch (error) {

            // No era JSON.
            // Puede ser texto normal.
        }

        // ==================================
        // FIN DE AUDIO
        // ==================================

        if (texto === '{"tipo":"fin_audio"}') {

              const audioWav = finalizarAudio(ws);

              try {

                console.log("📡 Enviando audio a Groq...");
                const textoTranscrito = await transcribirAudio(audioWav);

                console.log();
                console.log(" TRANSCRIPCIÓN:");
                console.log(textoTranscrito);

                const respuesta = await preguntar(textoTranscrito);
                console.log(" RESPUESTA:");
                console.log(respuesta);
                
              } catch (error) {
                console.error("❌ Error en la transcripción:");
                console.error(error);
              }

            return;

        }

        // ==================================
        // TEXTO NORMAL
        // ==================================

        console.log(
            `📩 Mensaje recibido de ${
                ws.dispositivo || "dispositivo desconocido"
            }: ${texto}`
        );

        // Más adelante podremos activar:
        //
        // await conversarWebSocket(texto, ws);
    });
}


// ========================================
// DESCONEXIÓN DEL CUERPO
// ========================================

export function manejarDesconexionCuerpo(ws) {

    console.log(
        `🔌 ${
            ws.dispositivo || "Dispositivo desconocido"
        } desconectado`
    );
}