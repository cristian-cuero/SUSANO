const Groq = require("groq-sdk");
const SUSANO_PROMPT = require("../prompts/prompts");

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function preguntar(memoria, mensaje) {
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

  return JSON.parse(texto);
}

module.exports = {
  preguntar,
};
