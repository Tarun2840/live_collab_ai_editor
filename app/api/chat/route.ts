import { NextRequest } from "next/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { messages, mode } = await req.json();
    const openai = getOpenAI();

    // default chat behavior; when mode === "edit", the content contains selected text & instruction
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      messages: messages ?? [],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ content }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), { status: 500 });
  }
}
