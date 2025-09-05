"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef } from "react";
import ChatSidebar from "@/components/ChatSidebar";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

export default function Home() {
  const editorRef = useRef<{ insert: (text: string) => void } | null>(null);

  const onRequestAIEdits = useCallback(async (original: string, action: string) => {
    const instruction = `Please ${action.toLowerCase()} the following selection. Return ONLY the edited text.\n\n---\n${original}`;
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You edit text precisely. Return only the revised selection without backticks or extra notes." },
          { role: "user", content: instruction },
        ],
        mode: "edit",
      })
    });
    const data = await r.json();
    return data.content as string;
  }, []);

  const editorInsert = (text: string) => {
    const el = document.querySelector("[contenteditable='true']");
    if (!el) return;
    // naive insert at cursor: paste at current selection
    document.execCommand("insertText", false, text);
  };

  return (
    <main className="grid grid-cols-1 md:grid-cols-[1fr_360px] h-screen">
      <div className="p-4">
        <Editor
          onRequestAIEdits={onRequestAIEdits}
          onInsert={editorInsert}
        />
      </div>
      <aside className="border-l bg-white/60 backdrop-blur p-2">
        <div className="h-full">
          <div className="p-3 pb-0">
            <h2 className="text-lg font-semibold">Chat with AI</h2>
            <p className="text-sm text-gray-500">Ask for ideas, summaries, or use /agent for web search.</p>
          </div>
          <div className="h-[calc(100%-56px)]">
            <ChatSidebar onInsert={editorInsert} />
          </div>
        </div>
      </aside>
    </main>
  );
}
