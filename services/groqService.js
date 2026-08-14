import Groq from "groq-sdk";
import SUSANO_PROMPT from "../prompts/prompts.js";

import { transmitirAudioPCM } from "./ttsService.js";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function preguntar(memoria, mensaje, socketCliente) {
  console.time("groq");

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: SUSANO_PROMPT,
      },
      {
        role: "user",
        content: `
        Memoria del usuario:
        ${memoria}

        Mensaje actual:
        ${mensaje}
        `,
      },
    ],
    temperature: 0.85,
    response_format: {
      type: "json_object",
    },
  });

  console.timeEnd("groq");

  const texto = completion.choices[0].message.content;

  const resultado = JSON.parse(texto);
  
  if (socketCliente && resultado.respuesta) {
    console.time("tts");
    await transmitirAudioPCM (resultado.respuesta, socketCliente);
    console.timeEnd("tts");
  }

  return resultado;
}

export const preguntarStream = async (memoria, mensaje, socketCliente) => {
  console.time("groq-stream");

  const stream = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: SUSANO_PROMPT,
      },
      {
        role: "user",
        content: `
Memoria del usuario:
${memoria}

Mensaje actual:
${mensaje}
        `,
      },
    ],
    temperature: 0.85,
    stream: true,
  });

  console.timeEnd("groq-stream");

  let respuestaCompleta = "";

  for await (const chunk of stream) {
    const contenido = chunk.choices[0]?.delta?.content || "";

    if (!contenido) {
      continue;
    }

    respuestaCompleta += contenido;

    // Mostrar inmediatamente cada fragmento
    process.stdout.write(`[${contenido}]`);
  }

  console.log("\n");

  return respuestaCompleta;
};

export default {
  preguntar,
  preguntarStream,
};
