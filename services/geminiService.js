const { GoogleGenAI } = require("@google/genai");
const SUSANO_PROMPT = require("../prompts/prompts");

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function preguntar(prompt) {
 const result = await genAI.models.generateContent({

    model: "gemini-3.5-flash",

    contents: "Responde únicamente: hola.",

    config: {
        responseMimeType: "text/plain",

        thinkingConfig: {
            thinkingBudget: 0
        }
    }

});
  console.log(result);
  return result.text
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function listarModelos() {
  const modelos = await ai.models.list();

  for await (const modelo of modelos) {
    console.log(modelo.name);
  }
}

listarModelos();
module.exports = {
  preguntar,
};
