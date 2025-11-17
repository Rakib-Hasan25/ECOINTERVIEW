from operation.document_preprocessor import DocumentPreprocessor
from langchain.schema import Document
from lib.supabase_config import supabase
from lib.openai_config import openai_embedding_instance
from langchain_community.vectorstores import SupabaseVectorStore
import logging
import traceback
import json

import re
def clean_text(text):
    # Remove extra whitespace
    text = ' '.join(text.split())
    # Remove special characters if needed
    text = re.sub(r'[^\w\s]', '', text)
    return text

def storedb(text,summarywithpage,chat_id) :
    preprocessor = DocumentPreprocessor()
    logger = logging.getLogger(__name__)

    # Separate text and image content for better organization
    text_documents = []
    image_documents = []
    context = ""
    try:
        if text:
            text_documents.extend([
                Document(
                    page_content=clean_text(x['text']),
                    metadata={
                        'type': 'text',
                        'page_number': x['page_number'],
                        'chat_id': chat_id
                    }
                ) for x in text
            ])
            
            logger.info(f"Processed {len(text_documents)} text documents")

        if summarywithpage:
            image_documents.extend([
                Document(
                    page_content=x['summary'],
                    metadata={
                        'type': 'image',
                        'page_number': x['page_number'],
                        'chat_id': chat_id
                    }
                ) for x in summarywithpage
            ])
            logger.info(f"Processed {len(image_documents)} image documents")
            
        combined_text = text_documents + image_documents
        embeddings = openai_embedding_instance(model="text-embedding-ada-002")
        
        if not combined_text:
            raise ValueError("No documents to process")
        
        # Validate embeddings
        if not embeddings:
            raise ValueError("Embeddings not initialized")
        
        logger.info(f"Creating vector store with {len(combined_text)} total documents")
        
        # Create serializable version of documents for return
        serialized_docs = []
        total_length = 0
        max_length = 1000  # Maximum total context length

        for doc in combined_text:
            content = str(doc.page_content)
            context +=content
            remaining_length = max_length - total_length
            
            if remaining_length <= 0:
                break
                
            if len(content) > remaining_length:
                content = content[:remaining_length] + "..."
                total_length = max_length
            else:
                total_length += len(content)
                
        #     serialized_docs.append({
        #         'content': content,
        #         'metadata': {
        #             'type': str(doc.metadata.get('type', 'unknown')),
        #             'page_number': int(doc.metadata.get('page_number', 0)),
        #             'chat_id': str(doc.metadata.get('chat_id', ''))
        #         }
        #     })
        
        # vector_store = SupabaseVectorStore.from_documents(
        #     combined_text,
        #     embeddings,
        #     client=supabase,
        #     table_name="documents",
        #     query_name="match_documents",
        #     chunk_size=1000,
        #     # chunk_overlap=200
        # )
        vector_store = 2
        logger.info(f"Vector store{context}")
        logger.info(f"Vector store created successfully. Total context length: {total_length} characters")
        return vector_store, context
        
    except ValueError as ve:
        error_msg = f"Validation error in vector store creation: {str(ve)}"
        logger.error(error_msg)
        return None, []
    except Exception as e:
        error_msg = f"Error in vector store creation: {str(e)}\nTraceback: {traceback.format_exc()}"
        logger.error(error_msg)
        return None, []





