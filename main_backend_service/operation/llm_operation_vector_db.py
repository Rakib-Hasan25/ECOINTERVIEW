from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain.schema import StrOutputParser
from lib.openai_config import openai_instance
import logging
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def operation_with_vectordb(vector_store, latest_msg, socketio, chat_id):
    try:
        logger.info(f"Starting similarity search for chat_id: {chat_id}")
        
        if not vector_store:
            raise ValueError("Vector store is not initialized")
            
        if not latest_msg:
            raise ValueError("Latest message is empty")
            
        if not chat_id:
            raise ValueError("Chat ID is not provided")

        # Use standard similarity search
        results = vector_store.similarity_search(
            latest_msg,
            k=3,  # Get top 3 results
            filter={"chat_id": chat_id}  # Filter by chat_id for better context
        )
        
        # socketio.emit("fetching-the-relevent-data-file")
        
        # Format results for Supabase vector store
        formatted_results = []
        for doc in results:
            result = {
                'content': doc.page_content,
                'metadata': {
                    'type': doc.metadata.get('type', 'unknown'),
                    'page_number': doc.metadata.get('page_number', 0),
                    'chat_id': doc.metadata.get('chat_id', '')
                }
            }
            formatted_results.append(result)
        
        logger.info(f"Found {len(formatted_results)} results for query: {latest_msg}")
        
        # socketio.emit("get_context", {
        #     "context": formatted_results
        # })
        logger.info(f"we are here sending the context")
        
    except ValueError as ve:
        error_msg = f"Validation error in similarity search: {str(ve)}"
        logger.error(error_msg)
        socketio.emit("get_context", {
            "context": [],
            "error": error_msg
        })
    except Exception as e:
        error_msg = f"Error in similarity search: {str(e)}\nTraceback: {traceback.format_exc()}"
        logger.error(error_msg)
        socketio.emit("get_context", {
            "context": [],
            "error": error_msg
        })
        








    # PROMPT_TEMPLATE = """
    # Use a Tree of Thought approach implicitly explore multiple reasoning paths before selecting the correct answer.
    # Context: {context}
    # follow the structure: 
    #       - Use the context to answer the question . 
    #       - answer should be very simple, short, straightforward
    #       - add proper markdown while answer
    #       - Evaluate and eliminate incorrect or weaker reasoning paths.
    #       - Select the strongest answer based on this internal evaluation.
    #       - Do not show your reasoning—only provide the final answer.
    #       - answer should be in markdown format
    #     Question: {query}
    #     Answer: """  
    # prompt = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    # # socketio.emit("generating-response")
    # model = openai_instance("gpt-4o",0.3,True)
    # summarize_chain =  {"context": lambda x: x}|{"query": lambda x: x}| prompt | model | StrOutputParser()
    # return summarize_chain.stream({ "context": results,
    #     "query": latest_msg})