# Book Study Platform

A personal study platform that helps you read, understand, and interact with your PDF books using RAG (Retrieval-Augmented Generation) technology. This project combines a modern Next.js frontend with a FastAPI backend to provide an intelligent reading and Q&A experience.

## Features

- 📚 **PDF Library Browser**: Browse and select PDFs from your personal library
- 📖 **PDF Reader**: Read PDFs with native browser viewer and page navigation
- 🤖 **AI Chatbot**: Ask questions about your books using RAG-powered responses
- 🔍 **Source Citations**: See which books/documents were used to answer your questions
- 💾 **Vector Storage**: Persistent storage using ChromaDB for fast retrieval

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **LangChain** - RAG framework
- **Groq** - Free-tier LLM for generating responses (Llama 3.1)
- **HuggingFace Embeddings** - Free, local embeddings (sentence-transformers)
- **ChromaDB** - Vector database for embeddings
- **PyPDF** - PDF processing

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Native PDF Viewer** - Browser-based iframe rendering
- **Lucide React** - Icons

## Project Structure

```
test_db/
├── backend/          # FastAPI backend
│   ├── main.py       # API endpoints
│   ├── rag_engine.py # RAG implementation
│   ├── storage.py    # File storage abstraction
│   └── requirements.txt
├── frontend/         # Next.js frontend
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.8+ (with venv)
- Node.js 18+ and npm
- Groq API key ([Get one free here](https://console.groq.com/))

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   
   Create a `.env` file in the `backend/` directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```
   
   Or export it:
   ```bash
   export GROQ_API_KEY=your_api_key_here
   ```

5. Configure library path:
   
   Edit `backend/main.py` and update line 28:
   ```python
   LIBRARY_PATH = "/path/to/your/pdf/library"
   ```

6. Start the backend server:
   ```bash
   python main.py
   # or
   uvicorn main:app --reload
   ```
   
   The API will be available at `http://localhost:8000`
   API documentation (Swagger UI) is available at `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:3000`

## Usage

1. **Add PDFs**: Place your PDF files in the library directory (configured in `backend/main.py`)

2. **Browse Books**: The file browser on the left shows all available PDFs

3. **Read**: Click on a book to open it in the PDF reader

4. **Ingest**: Click "Memorize Book" to add the book to the RAG system (this processes and indexes the PDF)

5. **Ask Questions**: Use the chat interface on the right to ask questions about your books. The AI will search through ingested books and provide answers with source citations.

## API Endpoints

- `GET /` - Health check
- `GET /books` - List all available PDFs
- `POST /ingest?filename=<path>` - Ingest a PDF into the RAG system
- `POST /chat` - Ask a question (body: `{message: string, book_context?: string, chat_history?: array}`)
- `GET /files/{file_path}` - Serve a PDF file
- `GET /health/rag` - Check RAG engine status

## Configuration

### Backend Configuration

- `GROQ_API_KEY`: Required - Your Groq API key (free tier available)
- `LIBRARY_PATH`: Hardcoded in `backend/main.py` line 28 - Path to your PDF library

### Frontend Configuration

The frontend is configured to connect to `http://localhost:8000` by default. To change this, update the API URLs in:
- `frontend/app/page.tsx`
- `frontend/components/file-browser.tsx`
- `frontend/components/pdf-reader.tsx`

## Development

### Backend Development

The backend uses FastAPI with hot-reload enabled. Make changes and they'll be reflected automatically.

### Frontend Development

The frontend uses Next.js with hot-reload. Changes to React components will update automatically in the browser.

## Troubleshooting

### PDF Not Opening
- Ensure backend is running on port 8000
- Check that the file exists in library
- Verify file path is correct
- Check browser console for CORS errors

### Chat Not Working
- Ensure backend is running
- Verify `GROQ_API_KEY` is set
- Vector store must have documents (ingest a book first)
- Check network tab for request/response errors

### Memorize Not Working
- Verify file exists in library
- Check `GROQ_API_KEY` is set
- Ensure file is a valid PDF
- Check backend logs for detailed errors

### ModuleNotFoundError
- Activate virtual environment: `source venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`

### Library Path Errors
- Use absolute paths (full path starting with `/`)
- Ensure directory exists and contains PDF files
- Check read permissions for the directory

### ChromaDB Issues
- Delete `backend/db_storage/` directory to reset (you'll need to re-ingest all books)

## Notes

- This is a personal project for studying books
- Make sure your PDFs are readable (not scanned images without OCR)
- The first ingestion of a book may take some time depending on the PDF size
- Vector database is stored in `backend/db_storage/` directory
- Groq free tier: 30 requests/minute, 14,400 requests/day
- Embeddings run locally (first run downloads ~80MB model, then cached)

## License

Personal project - for private use only.
