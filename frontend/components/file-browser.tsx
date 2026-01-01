"use client";

import { useEffect, useState } from "react";
import { Book, ChevronRight, File } from "lucide-react";
import clsx from "clsx";

interface FileBrowserProps {
    onSelectBook: (path: string) => void;
}

export function FileBrowser({ onSelectBook }: FileBrowserProps) {
    const [books, setBooks] = useState<any[]>([]);

    useEffect(() => {
        // Fetch books from FastAPI backend
        fetch("http://localhost:8000/books")
            .then((res) => res.json())
            .then((data) => setBooks(data));
    }, []);

    return (
        <div className="w-64 border-r border-stone-200 bg-stone-50 h-screen overflow-y-auto p-4 flex-shrink-0">
            <h2 className="text-xl font-serif text-stone-800 mb-6 flex items-center gap-2">
                <Book className="w-5 h-5" />
                Library
            </h2>
            <ul className="space-y-1">
                {books.map((book) => (
                    <li
                        key={book.path}
                        onClick={() => onSelectBook(book.path)}
                        className="group flex items-center gap-2 p-2 hover:bg-stone-200 rounded cursor-pointer transition-colors text-sm text-stone-600 hover:text-stone-900"
                    >
                        <File className="w-4 h-4 text-stone-400 group-hover:text-stone-600" />
                        <span className="truncate">{book.filename}</span>
                        <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50" />
                    </li>
                ))}
            </ul>
        </div>
    );
}
