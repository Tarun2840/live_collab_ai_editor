"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import clsx from "clsx";

type Props = {
  onRequestAIEdits: (original: string, action: string) => Promise<string | null>;
  onInsert: (text: string) => void;
  roomName?: string;
};

export default function Editor({ onRequestAIEdits, onInsert, roomName = "demo-room" }: Props) {
  const ydocRef = useRef<Y.Doc>();
  const providerRef = useRef<WebrtcProvider>();

  const [selectionText, setSelectionText] = useState<string>("");
  const [aiSuggestion, setAISuggestion] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Placeholder.configure({
        placeholder: "Start typing here… Use the chat to the right to talk to the AI.
Select text to open the floating toolbar.",
      }),
      Collaboration.configure({
        document: (() => {
          const doc = ydocRef.current || new Y.Doc();
          ydocRef.current = doc;
          return doc;
        })(),
      }),
      CollaborationCursor.configure({
        provider: (() => {
          // Create once
          if (!providerRef.current) {
            const room = typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("room") || roomName) : roomName;
            providerRef.current = new WebrtcProvider(room, ydocRef.current!);
          }
          return providerRef.current;
        })(),
        user: {
          name: typeof window !== "undefined" ? (localStorage.getItem("name") || `User-${Math.floor(Math.random()*1000)}`) : "User",
          color: "#0ea5e9",
        }
      }),
    ],
    editorProps: {
      attributes: { class: "prose prose-slate max-w-none focus:outline-none min-h-[60vh] p-6" },
      handleDOMEvents: {
        mouseup: () => {
          const text = window.getSelection()?.toString() || "";
          setSelectionText(text);
          return false;
        }
      }
    },
    content: "<h2>Welcome to the Live Collaborative AI Editor</h2><p>Type with your teammates and let the AI help! Select some text to try the floating toolbar.</p>"
  }, []);

  useEffect(() => {
    return () => {
      providerRef.current?.destroy();
      ydocRef.current?.destroy();
    };
  }, []);

  async function runAction(action: string) {
    const original = editor?.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, " ") || "";
    if (!original) return;
    const suggestion = await onRequestAIEdits(original, action);
    setAISuggestion(suggestion);
    setShowModal(true);
  }

  function applySuggestion() {
    if (!aiSuggestion || !editor) return;
    editor.chain().focus().insertContentAt({ from: editor.state.selection.from, to: editor.state.selection.to }, aiSuggestion).run();
    setShowModal(false);
    setAISuggestion(null);
  }

  return (
    <div className="relative h-full">
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 150 }}>
          <div className="rounded-2xl border bg-white shadow-lg p-2 flex gap-1">
            {["Fix grammar", "Shorten", "Lengthen", "Convert to table"].map(label => (
              <button
                key={label}
                className="px-2 py-1 text-sm rounded-xl hover:bg-gray-100"
                onClick={() => runAction(label)}
              >
                {label}
              </button>
            ))}
          </div>
        </BubbleMenu>
      )}
      <div className={clsx("rounded-2xl border shadow-sm bg-white")}>
        <EditorContent editor={editor} />
      </div>

      {/* Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">AI Edit Preview</h3>
              <button className="px-3 py-1 rounded-xl border" onClick={() => setShowModal(false)}>Close</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-2">Original</div>
                <pre className="p-3 rounded-xl bg-gray-50 whitespace-pre-wrap">{selectionText}</pre>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Suggestion</div>
                <pre className="p-3 rounded-xl bg-gray-50 whitespace-pre-wrap">{aiSuggestion}</pre>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded-xl border" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="px-4 py-2 rounded-xl bg-black text-white" onClick={applySuggestion}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
