"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Message = { role: "user" | "assistant" | "system"; content: string };

export default function ChatSidebar({ onInsert }: { onInsert: (text: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "You are a helpful AI assistant inside a collaborative editor."}
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const next = [...messages, { role: "user", content: input }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      // Agent shortcut: /agent query
      if (input.startsWith("/agent ")) {
        const query = input.slice(7);
        const r = await fetch("/api/agent/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query })
        });
        const data = await r.json();
        if (data?.data?.answer) {
          const answer = data.data.answer as string;
          setMessages(prev => [...prev, { role: "assistant", content: answer }]);
          setBusy(false);
          return;
        } else if (data?.data) {
          const merged = (data.data.results || []).map((r: any) => `- ${r.title}\n${r.url}\n${r.content}`).join("\n\n");
          setMessages(prev => [...prev, { role: "assistant", content: `Search results:\n\n${merged}` }]);
          setBusy(false);
          return;
        } else {
          setMessages(prev => [...prev, { role: "assistant", content: `Agent error: ${data?.error || "unknown"}` }]);
          setBusy(false);
          return;
        }
      }

      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next })
      });
      const data = await r.json();
      setMessages(m => [...m, { role: "assistant", content: data.content || "(no response)" }]);
    } catch (e: any) {
      setMessages(m => [...m, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-3 p-3">
        {messages.filter(m => m.role !== "system").map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={m.role === "user" ? "text-right" : "text-left"}
          >
            <div className={m.role === "user" ? "inline-block px-3 py-2 rounded-2xl bg-black text-white" : "inline-block px-3 py-2 rounded-2xl bg-gray-100"}>
              <pre className="whitespace-pre-wrap">{m.content}</pre>
            </div>
            {m.role === "assistant" && (
              <div className="mt-1">
                <button className="text-sm underline" onClick={() => onInsert(m.content)}>Insert into editor</button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <div className="border-t p-3 space-y-2">
        <input
          className="w-full border rounded-xl px-3 py-2"
          value={input}
          placeholder="Type a message…  (tip: /agent Find latest news on Next.js 15)"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
        />
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">AI can edit or insert text. Use /agent for web search (requires Tavily key).</div>
          <button className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50" onClick={send} disabled={busy}>
            {busy ? "Thinking…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
