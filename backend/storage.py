from abc import ABC, abstractmethod
from typing import List, Optional
import os
import glob

class StorageProvider(ABC):
    @abstractmethod
    def list_files(self) -> List[str]:
        """List all PDF files in the storage."""
        pass

    @abstractmethod
    def get_file_path(self, filename: str) -> str:
        """Get the absolute path or URL for a file."""
        pass

class LocalStorageProvider(StorageProvider):
    def __init__(self, base_dir: str = "library"):
        self.base_dir = os.path.abspath(base_dir)

    def list_files(self) -> List[str]:
        # Recursive glob to find all PDFs
        files = glob.glob(os.path.join(self.base_dir, "**/*.pdf"), recursive=True)
        # Return relative paths for cleaner APIs
        return [os.path.relpath(f, self.base_dir) for f in files]

    def get_file_path(self, filename: str) -> str:
        # Securely join paths to prevent directory traversal
        full_path = os.path.abspath(os.path.join(self.base_dir, filename))
        if not full_path.startswith(self.base_dir):
            raise ValueError("Access denied")
        return full_path

# Factory to get the correct provider
def get_storage_provider() -> StorageProvider:
    # Future: Check env var to return CloudStorageProvider
    return LocalStorageProvider()
