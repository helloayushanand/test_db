from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from storage import LocalStorageProvider
from rag_engine import rag_engine

app = FastAPI(title="Philosophy Platform API")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# USER CONFIG: Point to the MAPY folder
# In a real app, this would be in .env
LIBRARY_PATH = "/Users/ayush/Desktop/self/MAPY-first year"
storage = LocalStorageProvider(base_dir=LIBRARY_PATH)

class BookResponse(BaseModel):
    filename: str
    path: str

class ChatRequest(BaseModel):
    message: str
    book_context: str = None  # Optional: specific book to filter by

class ChatResponse(BaseModel):
    reply: str
    sources: List[str] = []

@app.get("/")
def health_check():
    return {"status": "ok", "library": LIBRARY_PATH}

@app.get("/books", response_model=List[BookResponse])
def list_books():
    """List all available PDFs in the MAPY library."""
    try:
        files = storage.list_files()
        return [{"filename": os.path.basename(f), "path": f} for f in files]
    except Exception as e:
        # Fallback if path is wrong
        raise HTTPException(status_code=500, detail=f"Error accessing library at {LIBRARY_PATH}: {str(e)}")

@app.post("/ingest")
def ingest_book(filename: str):
    """Trigger manual ingestion of a book."""
    try:
        full_path = storage.get_file_path(filename)
        rag_engine.ingest_file(full_path)
        return {"status": "ingested", "file": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """Ask a question to the RAG system."""
    try:
        # If book_context is provided, we could filter, but for now we search all
        answer = rag_engine.query(request.message, filter_filename=request.book_context)
        return {"reply": answer, "sources": []} # TODO: Return sources
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/files/{file_path:path}")
def get_file(file_path: str):
    """Serve a PDF file securely."""
    try:
        # Decode path if needed, but path param handles slashes
        full_path = storage.get_file_path(file_path)
        if not os.path.exists(full_path):
            raise HTTPException(status_code=404, detail="File not found")
        return FileResponse(full_path)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
