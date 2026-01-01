"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure worker locally
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfReaderProps {
    file: string | null;
}

export function PdfReader({ file }: PdfReaderProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setCurrentPage(1);
    }

    if (!file) {
        return (
            <div className="flex-1 flex items-center justify-center bg-stone-100 text-stone-400 font-serif italic mb-[10vh]">
                Select a book from the library to begin reading...
            </div>
        );
    }

    // The file path comes from the backend relative to the library root
    // We need to proxy it or serve it. For now, assuming direct file access or we need a specific endpoint to serve Bytes.
    // Actually, we need an endpoint to serve the PDF bytes. 
    // Let's assume the backend will serve it at http://localhost:8000/files/[path]
    // We will need to add that endpoint to backend/main.py next.

    return (
        <div className="flex-1 bg-stone-200 overflow-y-auto p-8 flex justify-center">
            <div className="bg-white shadow-xl min-h-[90vh]">
                <Document file={`http://localhost:8000/files/${file}`} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page
                        pageNumber={currentPage}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="border-b"
                        width={700}
                    />
                </Document>
            </div>
        </div>
    );
}
