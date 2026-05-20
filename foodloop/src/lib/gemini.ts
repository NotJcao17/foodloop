import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MODEL = "gemini-3.1-flash-lite";

function cleanJson(text: string): string {
  return text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
}

export async function generateRecipe(ingredients: string): Promise<{
  name: string;
  time: string;
  servings: string;
  ingredients: string[];
  steps: string[];
}> {
  const model = genAI.getGenerativeModel({ model: MODEL });
  const prompt = `Eres un chef experto en cocina casera. Con estos ingredientes disponibles: "${ingredients}", sugiere UNA receta práctica y sencilla.

IMPORTANTE: Responde ÚNICAMENTE con JSON válido, sin texto adicional, con exactamente esta estructura:
{
  "name": "Nombre del platillo",
  "time": "30 minutos",
  "servings": "2 porciones",
  "ingredients": ["200g de arroz", "1 pechuga de pollo"],
  "steps": ["Corta el pollo en cubos", "Calienta el aceite en una sartén"]
}`;

  const result = await model.generateContent(prompt);
  const text = cleanJson(result.response.text());
  return JSON.parse(text);
}

export async function generateStorageTips(food: string): Promise<{
  method: string;
  temperature: string;
  container: string;
  duration: string;
  tips: string[];
}> {
  const model = genAI.getGenerativeModel({ model: MODEL });
  const prompt = `Eres un experto en conservación de alimentos. Explica cómo conservar correctamente: "${food}".

IMPORTANTE: Responde ÚNICAMENTE con JSON válido, sin texto adicional, con exactamente esta estructura:
{
  "method": "Refrigeración",
  "temperature": "4°C o menos",
  "container": "Recipiente hermético o bolsa zip",
  "duration": "3-5 días",
  "tips": ["Consejo práctico 1", "Consejo práctico 2", "Consejo práctico 3"]
}`;

  const result = await model.generateContent(prompt);
  const text = cleanJson(result.response.text());
  return JSON.parse(text);
}
