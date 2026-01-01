"use client";

import { useState } from "react";
import { FileBrowser } from "@/components/file-browser";
import { PdfReader } from "@/components/pdf-reader";
import { Send } from "lucide-react";

export default function Home() {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [isIngesting, setIsIngesting] = useState(false);

  async function handleSendMessage() {
    if (!query.trim()) return;

    // Add user message
    const newHistory = [...chatHistory, { role: 'user' as const, content: query }];
    setChatHistory(newHistory);
    setQuery("");

    // Call API
    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, book_context: selectedBook?.split('/').pop() }),
      });
      const data = await res.json();
      setChatHistory([...newHistory, { role: 'ai', content: data.reply }]);
    } catch (e) {
      console.error(e);
      setChatHistory([...newHistory, { role: 'ai', content: "Error contacting the tutor." }]);
    }
  }

  async function handleIngest() {
    if (!selectedBook) return;
    setIsIngesting(true);
    try {
      await fetch(`http://localhost:8000/ingest?filename=${selectedBook}`, { method: 'POST' });
      alert("Book ingrained in memory!");
    } catch (e) {
      alert("Failed to ingest book.");
    } finally {
      setIsIngesting(false);
    }
  }

  return (
    <div className="flex h-screen bg-stone-100 font-sans">
      {/* Sidebar */}
      <FileBrowser onSelectBook={setSelectedBook} />

      {/* Main Content: Split View */}
      <div className="flex-1 flex flex-col h-full w-full">
        {/* Header */}
        <header className="h-14 border-b bg-white flex items-center px-4 justify-between">
          <h1 className="font-serif font-bold text-stone-700">The Agora</h1>
          {selectedBook && (
            <div className="flex gap-2">
              <span className="text-sm text-stone-500 py-1">{selectedBook}</span>
              <button
                onClick={handleIngest}
                disabled={isIngesting}
                className="text-xs bg-stone-800 text-white px-2 py-1 rounded hover:bg-stone-600 disabled:opacity-50"
              >
                {isIngesting ? "Memorizing..." : "Memorize Book"}
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* PDF Reader (Left) */}
          <div className="flex-1 border-r border-stone-200 relative">
            <PdfReader file={selectedBook} />
          </div>

          {/* Chat (Right) */}
          <div className="w-[400px] flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.length === 0 && (
                <p className="text-center text-stone-400 mt-10 italic">
                  Ask me anything about the text...
                </p>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={clsx(
                  "p-3 rounded-lg text-sm max-w-[90%]",
                  msg.role === 'user' ? "bg-stone-100 ml-auto text-stone-800" : "bg-blue-50 text-blue-900 border border-blue-100"
                )}>
                  {msg.content}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-stone-100">
              <div className="relative">
                <input
                  className="w-full bg-stone-50 border border-stone-200 rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
                  placeholder="Ask the tutor..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="absolute right-2 top-1.5 text-stone-400 hover:text-stone-600"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
