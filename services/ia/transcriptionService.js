// ========================================
// SERVICIO DE TRANSCRIPCIÓN
// ========================================

import Groq from "groq-sdk";
import { File } from "node:buffer";

// ========================================
// CLIENTE GROQ
// ========================================

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// ========================================
// TRANSCRIBIR AUDIO
// ========================================

export async function transcribirAudio(audioWav) {

    const resultado = await client.audio.transcriptions.create({
        file: new File(
            [audioWav],
            "susano_audio.wav",
            {
                type: "audio/wav"
            }
        ),
        model: "whisper-large-v3-turbo",
        language: "es"
    });

    return resultado.text;
}

