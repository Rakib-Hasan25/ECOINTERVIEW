from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List, Dict
import unicodedata
import re
from datetime import datetime
class DocumentPreprocessor:
    def __init__(self, chunk_size=500, chunk_overlap=50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            #It helps ensure that important context isn't lost when the text is split
            # chunk_overlap=5: The last 5 characters of Chunk 1 will appear again at the beginning of Chunk 2

            length_function=len,
            is_separator_regex=False
            # The is_separator_regex parameter determines
            # whether the splitting of text should use a regular
            # expression (regex) pattern to identify where to split, or whether
            # it should use a simpler method based on the chunk size and overlap
        )

    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Normalize unicode characters
        text = unicodedata.normalize('NFKC', text)

        # Replace multiple spaces with single space
        text = re.sub(r'\s+', ' ', text)

        # Remove special characters but keep necessary punctuation
        text = re.sub(r'[^\w\s.,!?-]', '', text)

        # Remove extra whitespace
        text = text.strip()

        return text

    def remove_headers_footers(self, text: str) -> str:
        """Remove common headers and footers"""
        # Split into lines
        lines = text.split('\n')

        # Remove common header/footer patterns
        filtered_lines = []
        for line in lines:
            # Skip if line contains common header/footer patterns
            if any(pattern in line.lower() for pattern in [
                'page', 'confidential', 'all rights reserved',
                'copyright', 'private and confidential'
            ]):
                continue
            filtered_lines.append(line)

        return '\n'.join(filtered_lines)

    def create_chunks(self, text: str) -> List[str]:
        """Split text into semantically meaningful chunks"""
        # First split into sentences

        print(text)
        # Then use text splitter for final chunks
        chunks = self.text_splitter.create_documents([text])

        return [chunk.page_content for chunk in chunks]

    def generate_metadata(self, chunk: str, doc_id: str,page_number:str, chunk_index: int) -> Dict:
        """Generate metadata for each chunk"""
        return {
            'doc_id': doc_id,
            'page_number':page_number,
            'chunk_id': f"page_number: {doc_id}_chunk_{chunk_index}",
            'word_count': len(chunk.split()),
            'char_count': len(chunk),


        }

    def process_document(self, text: str, doc_id: str,page_number:str) -> List[Dict]:

        """Process entire document and return chunks with metadata"""
        # Step 1: Clean text
        clean_text = self.clean_text(text)

        # Step 2: Remove headers/footers
        text_no_headers = self.remove_headers_footers(clean_text)

        # Step 3: Create chunks
        chunks = self.create_chunks(text_no_headers)

        # Step 4: Generate metadata and final output
        processed_chunks = []
        for i, chunk in enumerate(chunks):
            processed_chunks.append({
                'content': chunk,
                'metadata': self.generate_metadata(chunk, doc_id, i,page_number)
            })

        return processed_chunks
    
    def process_image(self,text:str,page_number:str,doc_id:str) -> Dict:
        clean_text = self.clean_text(text)
        chunks = self.create_chunks(clean_text)
        processed_chunks = []
        for i, chunk in enumerate(chunks):
            processed_chunks.append({
                'content': chunk,
                'metadata': self.generate_metadata(chunk, doc_id, i,page_number)
            })

        return processed_chunks
