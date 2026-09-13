import "dotenv/config";
import fs from "fs";

import { transcribirAudio } from "./services/ia/transcriptionService.js";

async function probarTranscripcion() {

    try {

        console.log("🎤 Cargando WAV...");

        const audioWav = fs.readFileSync(
            "audio.wav"
        );

        console.log(
            `📦 WAV cargado: ${audioWav.length} bytes`
        );

        console.log("📡 Enviando audio a Groq...");

        const texto = await transcribirAudio(
            audioWav
        );

        console.log();
        console.log("📝 TRANSCRIPCIÓN:");
        console.log(texto);

    } catch (error) {

        console.error(
            "❌ Error en la transcripción:"
        );

        console.error(error);
    }
}

probarTranscripcion();