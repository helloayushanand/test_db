"use client";

import { useEffect, useState } from "react";
import { Book, ChevronRight, ChevronDown, File, X, Folder } from "lucide-react";

interface FileBrowserProps {
    onSelectBook: (path: string) => void;
    onClose?: () => void;
}

interface FileItem {
    filename: string;
    path: string;
}

interface FolderNode {
    files: FileItem[];
    folders: { [key: string]: FolderNode };
}

// Build folder tree structure from flat file list
function buildFolderTree(files: FileItem[]): FolderNode {
    const root: FolderNode = { files: [], folders: {} };

    for (const file of files) {
        const pathParts = file.path.split('/');
        
        // If file is at root level (no folders in path)
        if (pathParts.length === 1) {
            root.files.push(file);
        } else {
            // Navigate/create folder structure
            let current = root;
            
            // Process all folder parts except the last (which is the filename)
            for (let i = 0; i < pathParts.length - 1; i++) {
                const folderName = pathParts[i];
                
                if (!current.folders[folderName]) {
                    current.folders[folderName] = { files: [], folders: {} };
                }
                
                current = current.folders[folderName];
            }
            
            // Add file to the final folder
            current.files.push(file);
        }
    }

    return root;
}

export function FileBrowser({ onSelectBook, onClose }: FileBrowserProps) {
    const [books, setBooks] = useState<FileItem[]>([]);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Fetch books from FastAPI backend
        fetch("http://localhost:8000/books")
            .then((res) => res.json())
            .then((data) => {
                setBooks(data);
                // All folders collapsed by default
                setExpandedFolders(new Set());
            });
    }, []);

    const folderTree = buildFolderTree(books);

    // Toggle folder expand/collapse
    function toggleFolder(folderPath: string) {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(folderPath)) {
                newSet.delete(folderPath);
            } else {
                newSet.add(folderPath);
            }
            return newSet;
        });
    }

    // Render folder tree recursively
    function renderFolderTree(node: FolderNode, folderPath: string = '', level: number = 0): JSX.Element[] {
        const items: JSX.Element[] = [];
        const indent = level * 16; // 16px per level

        // Render files in current folder
        node.files.forEach((file) => {
            items.push(
                <li
                    key={file.path}
                    onClick={() => onSelectBook(file.path)}
                    className="group flex items-center gap-2 p-2 hover:bg-stone-200 dark:hover:bg-slate-700 rounded cursor-pointer transition-colors text-sm text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-slate-100"
                    style={{ paddingLeft: `${indent + 8}px` }}
                >
                    <File className="w-4 h-4 text-stone-400 dark:text-slate-500 group-hover:text-stone-600 dark:group-hover:text-slate-300 flex-shrink-0" />
                    <span className="truncate">{file.filename}</span>
                </li>
            );
        });

        // Render subfolders
        Object.entries(node.folders).forEach(([folderName, subNode]) => {
            const currentPath = folderPath ? `${folderPath}/${folderName}` : folderName;
            const isExpanded = expandedFolders.has(currentPath);

            items.push(
                <li key={currentPath}>
                    <div
                        onClick={() => toggleFolder(currentPath)}
                        className="group flex items-center gap-2 p-2 hover:bg-stone-200 dark:hover:bg-slate-700 rounded cursor-pointer transition-colors text-sm text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-slate-100"
                        style={{ paddingLeft: `${indent + 8}px` }}
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-stone-400 dark:text-slate-500 flex-shrink-0" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-stone-400 dark:text-slate-500 flex-shrink-0" />
                        )}
                        <Folder className="w-4 h-4 text-stone-400 dark:text-slate-500 group-hover:text-stone-600 dark:group-hover:text-slate-300 flex-shrink-0" />
                        <span className="truncate font-medium">{folderName}</span>
                    </div>
                    {isExpanded && (
                        <ul className="space-y-1">
                            {renderFolderTree(subNode, currentPath, level + 1)}
                        </ul>
                    )}
                </li>
            );
        });

        return items;
    }

    return (
        <div className="w-64 border-r border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 h-screen overflow-y-auto p-4 flex-shrink-0 transition-colors duration-300">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif text-stone-800 dark:text-slate-200 flex items-center gap-2 transition-colors duration-300">
                    <Book className="w-5 h-5" />
                    Library
                </h2>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Close library"
                        title="Close library"
                    >
                        <X className="w-4 h-4 text-stone-600 dark:text-slate-300" />
                    </button>
                )}
            </div>
            <ul className="space-y-1">
                {renderFolderTree(folderTree)}
            </ul>
        </div>
    );
}
