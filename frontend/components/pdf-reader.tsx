"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PdfReaderProps {
    file: string | null;
}

export function PdfReader({ file }: PdfReaderProps) {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageInput, setPageInput] = useState<string>("1");

    // URL encode the file path for the API
    const encodedFile = file ? encodeURIComponent(file) : "";
    const basePdfUrl = file ? `http://localhost:8000/files/${encodedFile}` : null;
    const pdfUrl = basePdfUrl ? `${basePdfUrl}#page=${currentPage}` : null;

    function goToPrevPage() {
        if (currentPage > 1) {
            const newPage = currentPage - 1;
            setCurrentPage(newPage);
            setPageInput(newPage.toString());
        }
    }

    function goToNextPage() {
        const newPage = currentPage + 1;
        setCurrentPage(newPage);
        setPageInput(newPage.toString());
    }

    function handlePageInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setPageInput(e.target.value);
    }

    function handlePageInputSubmit(e: React.FormEvent) {
        e.preventDefault();
        const page = parseInt(pageInput);
        if (!isNaN(page) && page > 0) {
            setCurrentPage(page);
        } else {
            setPageInput(currentPage.toString());
        }
    }

    function handlePageInputBlur() {
        const page = parseInt(pageInput);
        if (isNaN(page) || page < 1) {
            setPageInput(currentPage.toString());
        } else {
            setCurrentPage(page);
        }
    }

    if (!file) {
        return (
            <div className="flex-1 flex items-center justify-center bg-stone-100 text-stone-400 font-serif italic">
                Select a book from the library to begin reading...
            </div>
        );
    }

    return (
        <div className="flex-1 bg-stone-200 overflow-hidden flex flex-col h-full">
            {/* Page Navigation Controls */}
            <div className="bg-white border-b border-stone-200 px-4 py-2 flex items-center justify-center gap-4">
                <button
                    onClick={goToPrevPage}
                    disabled={currentPage <= 1}
                    className="p-2 rounded hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-5 h-5 text-stone-600" />
                </button>
                
                <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
                    <span className="text-sm text-stone-600">Page</span>
                    <input
                        type="number"
                        min="1"
                        value={pageInput}
                        onChange={handlePageInputChange}
                        onBlur={handlePageInputBlur}
                        className="w-16 px-2 py-1 text-sm border border-stone-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                </form>
                
                <button
                    onClick={goToNextPage}
                    className="p-2 rounded hover:bg-stone-100 transition-colors"
                    aria-label="Next page"
                >
                    <ChevronRight className="w-5 h-5 text-stone-600" />
                </button>
            </div>

            {/* PDF iframe */}
            <div className="flex-1 relative bg-stone-300">
                {pdfUrl ? (
                    <iframe
                        key={pdfUrl}
                        src={pdfUrl}
                        className="w-full h-full border-0"
                        title="PDF Viewer"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-stone-500">Loading PDF...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
