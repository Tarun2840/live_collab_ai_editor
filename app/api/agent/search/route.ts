import { NextRequest } from "next/server";

type TavilyResult = {
  query: string;
  results: Array<{ title: string; url: string; content: string; score?: number }>;
};

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey) {
    return new Response(JSON.stringify({ error: "TAVILY_API_KEY not set" }), { status: 400 });
  }

  const tavily = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tavilyKey}` },
    body: JSON.stringify({ query, search_depth: "advanced", include_answer: true, max_results: 5 })
  });

  if (!tavily.ok) {
    const t = await tavily.text();
    return new Response(JSON.stringify({ error: `Tavily error: ${t}` }), { status: 500 });
  }

  const data = await tavily.json() as TavilyResult & { answer?: string };
  return new Response(JSON.stringify({ data }), { status: 200 });
}
