// ========================================
// HELPER DE AUDIO DEL CUERPO
// ========================================

// ========================================
// INICIAR AUDIO
// ========================================

export function iniciarAudio(ws) {
  ws.audioChunks = [];
  ws.audioBytes = 0;

  console.log("🎤 Sistema de audio del CUERPO preparado");
}

// ========================================
// RECIBIR AUDIO PCM
// ========================================

export function recibirAudio(ws, mensaje) {
  if (!mensaje || mensaje.length === 0) {
    return;
  }

  const chunk = Buffer.from(mensaje);

  ws.audioChunks.push(chunk);

  ws.audioBytes += chunk.length;

  const muestras = chunk.length / 2;

  console.log(
    `🎤 PCM: ${chunk.length} bytes | ` +
      `${muestras} muestras | ` +
      `acumulado: ${ws.audioBytes} bytes`,
  );
}

// ========================================
// CREAR ARCHIVO WAV
// ========================================

export function crearWav(audioPCM) {
  const sampleRate = 16000;
  const canales = 1;
  const bitsPorMuestra = 16;

  const byteRate = sampleRate * canales * (bitsPorMuestra / 8);

  const blockAlign = canales * (bitsPorMuestra / 8);

  const header = Buffer.alloc(44);

  // RIFF
  header.write("RIFF", 0);

  // Tamaño total del archivo - 8 bytes
  header.writeUInt32LE(36 + audioPCM.length, 4);

  // WAVE
  header.write("WAVE", 8);

  // fmt
  header.write("fmt ", 12);

  // Tamaño del bloque fmt
  header.writeUInt32LE(16, 16);

  // PCM
  header.writeUInt16LE(1, 20);

  // Canales
  header.writeUInt16LE(canales, 22);

  // Sample rate
  header.writeUInt32LE(sampleRate, 24);

  // Byte rate
  header.writeUInt32LE(byteRate, 28);

  // Block align
  header.writeUInt16LE(blockAlign, 32);

  // Bits por muestra
  header.writeUInt16LE(bitsPorMuestra, 34);

  // data
  header.write("data", 36);

  // Tamaño del audio
  header.writeUInt32LE(audioPCM.length, 40);

  return Buffer.concat([header, audioPCM]);
}
// ========================================
// FINALIZAR AUDIO
// ========================================

export function finalizarAudio(ws) {

  const audioCompleto = Buffer.concat(ws.audioChunks);


  const audioWav = crearWav(audioCompleto);
  console.log(`🎵 WAV creado: ${audioWav.length} bytes`);

  ws.audioChunks = [];
  ws.audioBytes = 0;

  return audioWav;
}
