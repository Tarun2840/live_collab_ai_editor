import OpenAI from "openai";

export function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }
  return new OpenAI({ apiKey });
}

export async function simpleEdit(prompt: string) {
  const client = getOpenAI();
  // Using responses for flexibility
  const res = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a concise writing assistant. Only return the edited text with no extra commentary." },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
  });
  return res.choices[0]?.message?.content || "";
}
