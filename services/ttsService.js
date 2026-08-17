import { EdgeTTS } from "node-edge-tts";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";
import crypto from "crypto";
import { performance } from "perf_hooks";

const tts = new EdgeTTS({
  voice: "es-CO-GonzaloNeural",
  lang: "es-CO",
  outputFormat: "audio-24khz-48kbitrate-mono-mp3",
  rate: "+10%",
  pitch: "+0Hz",
});

const TAMANO_PAQUETE = 1920;

// ⏱️ Función auxiliar para pausar el envío sin bloquear el Event Loop
const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function transmitirAudioPCM(texto, socketCliente) {
  const inicioTTS = performance.now();
  console.log("🎙️ TTS iniciado");

  return new Promise(async (resolve, reject) => {
    let wsTTS;
    let ffmpeg;

    try {
      wsTTS = await tts._connectWebSocket();
      const separator = "Path:audio\r\n";

      ffmpeg = spawn(ffmpegPath, [
        "-i", "pipe:0",
        "-f", "s16le",
        "-acodec", "pcm_s16le",
        "-ar", "24000",
        "-ac", "1",
        "pipe:1",
      ]);

      let bufferPCM = Buffer.alloc(0);
      let primerMP3 = true;
      let primerPCM = true;
      let bytesPCM = 0;
      let paquetesPCM = 0;

      // ==========================================
      // 🎵 PCM SALIENDO DE FFMPEG (AHORA ES ASYNC)
      // ==========================================
      ffmpeg.stdout.on("data", async (chunkPCM) => {
        if (primerPCM) {
          const tiempo = performance.now() - inicioTTS;
          console.log(`⚡ PRIMER PCM: ${tiempo.toFixed(2)} ms`);
          primerPCM = false;
        }

        bufferPCM = Buffer.concat([bufferPCM, chunkPCM]);

        // Mientras tengamos al menos 1920 bytes
        while (bufferPCM.length >= TAMANO_PAQUETE) {
          const paquete = bufferPCM.subarray(0, TAMANO_PAQUETE);
          bufferPCM = bufferPCM.subarray(TAMANO_PAQUETE);

          if (socketCliente && socketCliente.readyState === 1) {
            socketCliente.send(paquete);
            bytesPCM += paquete.length;
            paquetesPCM++;

            // ⏱️ CLAVE: Pausa de 35ms para sincronizar el envío con el tiempo de reproducción real del ESP32
            await esperar(40);
          }
        }
      });

      ffmpeg.on("error", (error) => {
        console.error("❌ Error FFmpeg:", error.message);
        reject(error);
      });

      ffmpeg.stderr.on("data", () => {});

      ffmpeg.on("close", async (code) => {
        // Enviar el sobrante si queda algo
        if (
          bufferPCM.length > 0 &&
          socketCliente &&
          socketCliente.readyState === 1
        ) {
          socketCliente.send(bufferPCM);
          bytesPCM += bufferPCM.length;
          paquetesPCM++;
          console.log(`📦 Último paquete: ${bufferPCM.length} bytes`);
        }

        const tiempoTotal = performance.now() - inicioTTS;

        console.log(`🏁 FFmpeg finalizó. Código: ${code}`);
        console.log(`📦 Paquetes PCM enviados: ${paquetesPCM}`);
        console.log(`💾 Bytes PCM enviados: ${bytesPCM}`);
        console.log(`⏱️ Tiempo total TTS: ${tiempoTotal.toFixed(2)} ms`);

        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg terminó con código ${code}`));
        }
      });

      wsTTS.on("message", (data, isBinary) => {
        if (isBinary) {
          if (primerMP3) {
            const tiempo = performance.now() - inicioTTS;
            console.log(`🎵 PRIMER MP3: ${tiempo.toFixed(2)} ms`);
            primerMP3 = false;
          }

          const index = data.indexOf(separator) + separator.length;
          const audioData = data.subarray(index);

          if (audioData.length > 0) {
            ffmpeg.stdin.write(audioData);
          }
        } else {
          const message = data.toString();
          if (message.includes("Path:turn.end")) {
            ffmpeg.stdin.end();
            wsTTS.close();
          }
        }
      });

      const requestId = crypto.randomBytes(16).toString("hex");

      wsTTS.send(
        `X-RequestId:${requestId}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `Path:ssml\r\n\r\n` +
        `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${tts.lang}">` +
        `<voice name="${tts.voice}">` +
        `<prosody rate="${tts.rate}" pitch="${tts.pitch}" volume="+100%">` +
        `${texto}` +
        `</prosody>` +
        `</voice>` +
        `</speak>`
      );

    } catch (error) {
      console.error("❌ Error en streaming TTS:", error);
      reject(error);
    }
  });
}