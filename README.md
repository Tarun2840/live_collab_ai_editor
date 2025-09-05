# Live Collaborative AI Editor (Next.js + Tiptap + Yjs)

A demo showing:
- **Live collaboration** (Yjs + y-webrtc) in Tiptap
- **Chat sidebar** talking to an LLM (OpenAI by default)
- **AI-powered edits** via a floating toolbar (BubbleMenu) with preview/confirm
- **Bonus Agent** that can perform **web search** via Tavily and return summaries you can insert into the editor

> This is a demo, not production-ready. Deploys cleanly to **Vercel/Netlify**.

## Quick Start (Local)

```bash
pnpm i # or npm i / yarn
cp .env.example .env.local
# fill in OPENAI_API_KEY (and TAVILY_API_KEY for /agent)
pnpm dev
```

Open http://localhost:3000. Share the URL with a friend; add `?room=my-room` to collaborate.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import into Vercel, set env vars:
   - `OPENAI_API_KEY`
   - (optional) `OPENAI_MODEL` (default `gpt-4o-mini`)
   - (optional) `TAVILY_API_KEY` for `/agent`
3. Deploy. Visit your URL and optionally add `?room=team1` to pick a room.

## Deploy to Netlify

1. Create a new site from Git repo.
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Environment variables same as above.

## How It Works

- **Tiptap + Yjs**: `@tiptap/extension-collaboration` with `y-webrtc` enables peer-to-peer realtime collab (uses public signaling servers).
- **Floating Toolbar**: Uses Tiptap `BubbleMenu`. Available actions: Fix grammar, Shorten, Lengthen, Convert to table. It previews AI suggestion and applies on confirm.
- **Chat Sidebar**: Talks to `/api/chat` (OpenAI). Every assistant message includes an **Insert into editor** button.
- **Agent**: Type `/agent your query` (e.g., `/agent Find latest news on Next.js 15`). Requires `TAVILY_API_KEY`. The serverless route calls Tavily and returns either `answer` or search results.

## Notes

- If you don't set `OPENAI_API_KEY`, `/api/chat` will return an error.
- y-webrtc is a demo transport. For production, consider a Yjs server (y-websocket) or TipTap Pro collaboration server.
- Styling uses Tailwind; animations via Framer Motion; icons via lucide-react (not heavily used).
- The naive `insert at cursor` uses `document.execCommand`. For a robust approach, use Tiptap commands to insert at selection inside the editor instance.

## License

MIT
