"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { FileBrowser } from "@/components/file-browser";
import { Send } from "lucide-react";
import clsx from "clsx";

// Dynamically import PdfReader with SSR disabled to avoid DOMMatrix errors
const PdfReader = dynamic(() => import("@/components/pdf-reader").then(mod => ({ default: mod.PdfReader })), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-stone-100 text-stone-400 font-serif italic">
      Loading PDF reader...
    </div>
  )
});

export default function Home() {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', content: string, sources?: string[] }[]>([]);
  const [isIngesting, setIsIngesting] = useState(false);
  const [previousBook, setPreviousBook] = useState<string | null>(null);

  // Handle book selection change
  function handleBookSelect(book: string | null) {
    // If switching to a different book, optionally clear chat history
    if (previousBook && previousBook !== book && book) {
      // You can uncomment this to auto-clear chat when switching books
      // setChatHistory([]);
    }
    setPreviousBook(book);
    setSelectedBook(book);
  }

  async function handleSendMessage() {
    if (!query.trim()) return;

    const userMessage = query;
    // Add user message
    const newHistory = [...chatHistory, { role: 'user' as const, content: userMessage }];
    setChatHistory(newHistory);
    setQuery("");

    // Call API
    try {
      // Prepare chat history for context (last 5 messages to avoid token limits)
      const recentHistory = chatHistory.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage, 
          book_context: selectedBook?.split('/').pop(),
          chat_history: recentHistory
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(errorData.detail || `Server error: ${res.status}`);
      }
      
      const data = await res.json();
      setChatHistory([...newHistory, { 
        role: 'ai', 
        content: data.reply, 
        sources: data.sources || [] 
      }]);
    } catch (e: any) {
      console.error("Chat error:", e);
      const errorMsg = e.message || "Error contacting the tutor. Make sure the backend is running.";
      setChatHistory([...newHistory, { 
        role: 'ai', 
        content: `Error: ${errorMsg}` 
      }]);
    }
  }

  async function handleIngest() {
    if (!selectedBook) return;
    setIsIngesting(true);
    try {
      const encodedFilename = encodeURIComponent(selectedBook);
      const response = await fetch(`http://localhost:8000/ingest?filename=${encodedFilename}`, { 
        method: 'POST' 
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      alert(`Success! ${data.message || 'Book ingrained in memory!'}`);
    } catch (e: any) {
      const errorMsg = e.message || "Failed to ingest book. Check backend logs.";
      alert(`Error: ${errorMsg}`);
      console.error("Ingest error:", e);
    } finally {
      setIsIngesting(false);
    }
  }

  return (
    <div className="flex h-screen bg-stone-100 font-sans">
      {/* Sidebar */}
      <FileBrowser onSelectBook={handleBookSelect} />

      {/* Main Content: Split View */}
      <div className="flex-1 flex flex-col h-full w-full">
        {/* Header */}
        <header className="h-14 border-b bg-white flex items-center px-4 justify-between">
          <h1 className="font-serif font-bold text-stone-700">The Agora</h1>
          {selectedBook && (
            <div className="flex gap-2 items-center">
              <span className="text-sm text-stone-500 py-1">{selectedBook}</span>
              <button
                onClick={handleIngest}
                disabled={isIngesting}
                className="text-xs bg-stone-800 text-white px-2 py-1 rounded hover:bg-stone-600 disabled:opacity-50"
              >
                {isIngesting ? "Memorizing..." : "Memorize Book"}
              </button>
              {chatHistory.length > 0 && (
                <button
                  onClick={() => setChatHistory([])}
                  className="text-xs bg-stone-300 text-stone-700 px-2 py-1 rounded hover:bg-stone-400"
                  title="Clear chat history"
                >
                  Clear Chat
                </button>
              )}
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
                  <div>{msg.content}</div>
                  {msg.role === 'ai' && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-blue-200">
                      <div className="text-xs text-blue-700 font-semibold mb-1">Sources:</div>
                      <ul className="text-xs text-blue-600 space-y-1">
                        {msg.sources.map((source, idx) => (
                          <li key={idx} className="truncate">• {source}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
