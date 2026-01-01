
import os
from typing import List
from langchain_community.document_loaders import PyPDFLoader
# UPDATED: Using Google GenAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_classic.chains import RetrievalQA
from langchain.schema import Document
import shutil

class RAGEngine:
    def __init__(self, persist_directory: str = "db_storage"):
        self.persist_directory = persist_directory
        # Check for Gemini Key
        if not os.getenv("GOOGLE_API_KEY"):
            print("WARNING: GOOGLE_API_KEY not found. Please export it.")

        # Updated Embeddings: models/embedding-001
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        
        self.vector_store = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings
        )
        
        # Updated LLM: gemini-1.5-flash (Fast & Cheap) or gemini-1.5-pro
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            temperature=0.3,
            convert_system_message_to_human=True
        )

    def ingest_file(self, file_path: str, collection_name: str = "default"):
        """Reads a PDF, chunks it, and saves vectors."""
        print(f"Ingesting: {file_path}")
        loader = PyPDFLoader(file_path)
        documents = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=200)
        chunks = text_splitter.split_documents(documents)

        for chunk in chunks:
            chunk.metadata["source"] = os.path.basename(file_path)

        self.vector_store.add_documents(chunks)
        self.vector_store.persist()
        print(f"Ingested {len(chunks)} chunks from {file_path}")

    def query(self, question: str, filter_filename: str = None) -> str:
        search_kwargs = {"k": 5}
        if filter_filename:
            search_kwargs["filter"] = {"source": filter_filename}

        retriever = self.vector_store.as_retriever(search_kwargs=search_kwargs)
        
        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True
        )

        result = qa_chain.invoke({"query": question})
        return result["result"]

rag_engine = RAGEngine()
