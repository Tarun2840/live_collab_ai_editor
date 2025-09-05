import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Live Collaborative AI Editor",
  description: "Tiptap + Yjs + Chat sidebar + AI edits + Agent search demo",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
