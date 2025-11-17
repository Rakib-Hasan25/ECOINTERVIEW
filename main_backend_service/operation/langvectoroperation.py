from config.get_specific_model import get_chat_model
from flask import request
# from langchain_pinecone import PineconeVectorStore
from langchain_core.prompts import ChatPromptTemplate
# from config.get_specific_model import get_chat_model, get_embedding_model
# from config.pincone_setup import index_name
from flask import Response

from dotenv import load_dotenv 
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()  

def generate(llm,prompt):
    for chunk in llm.stream(prompt):
        if hasattr(chunk, 'content'):
            yield f"{chunk.content}"




# def QuestionAnswerUsingContentWithSimilarity():
#     print("hello world")
#     data = request.get_json() # data come as json object
#     dict_data = dict(data)
#     query_text = dict_data['query_text']
#     unique_id = dict_data['unique_id']
#     # context = dict_data['context']
   
    
#         # Initialize embeddings and vector store
#     print("first time")

#     logger.info(f"Processing query: {query_text}")
    
#     # 1. DECISION MODEL: Determine if this query needs context retrieval
#     decision_model = get_chat_model(model_name="gpt-3.5-turbo", temperature=0)
    
#     DECISION_PROMPT = """
#     Determine if the following query requires retrieving specific context from a knowledge base 
#     or if it can be answered directly with general knowledge.
    
#     Query: {query}
    
#     Respond with either "NEEDS_CONTEXT" or "NO_CONTEXT_NEEDED" followed by a very brief explanation.
#     Only use "NEEDS_CONTEXT" if the query explicitly requires specific information that would 
#     be found in documentation, specific data, or specialized knowledge.
#     """
    
#     decision_prompt_template = ChatPromptTemplate.from_template(DECISION_PROMPT)
#     decision_prompt = decision_prompt_template.format(query=query_text)
    
#     try:
#         decision_response = decision_model.invoke(decision_prompt)
#         decision_text = decision_response.content.strip()
#         logger.info(f"Decision: {decision_text}")
        
#         needs_context = "NEEDS_CONTEXT" in decision_text.upper()
        
#         # 2. CONTEXT RETRIEVAL PATH (if needed)
#         context_text = ""
#         if needs_context:
#             logger.info("Retrieving context from vector database")
            
#             # Initialize embedding model
#             embeddings = get_embedding_model()
            
#             # Connect to vector database
#             try:
#                 vectorstore = PineconeVectorStore.from_existing_index(
#                     index_name=index_name,
#                     embedding=embeddings
#                 )
                
#                 # Perform similarity search with filtering
#                 results = vectorstore.similarity_search(
#                     query=query_text,
#                     k=5,
#                     filter={"unique_id": unique_id}
#                 )
                
#                 # Combine retrieved documents
#                 if results:
#                     context_text = "\n\n---\n\n".join([doc.page_content for doc in results])
#                     logger.info(f"Retrieved {len(results)} documents")
#                 else:
#                     logger.warning("No matching documents found in vector store")
#             except Exception as e:
#                 logger.error(f"Error retrieving from vector database: {str(e)}")
#                 context_text = "[Error retrieving context]"
#         else:
#             logger.info("Skipping context retrieval based on decision model")
            
#         # 3. RESPONSE GENERATION (with or without context)
#         model2 = get_chat_model(model_name="gpt-4o", temperature=0.4, streaming=True)
        
#         if needs_context:
#             PROMPT_TEMPLATE = """
#             **STRUCTURE TEMPLATE**:
#             ## Analysis
#             - Context information: {context}
#             - Query to address: {query}
            
#             ## Our output : 
#             - Answer based primarily on the provided context
#             - Keep response concise and focused
#             - mathematical equations should start with $$ and end with $$ 
#             - while answer not need to output "Query to address: {query}"
            
            
#             Final Answer:
#             """
#         else:
#             PROMPT_TEMPLATE = """
#             **STRUCTURE TEMPLATE**:
#             ## Analysis
#             - Query to address: {query}
            
#             ## Response
#             - Answer based on your general knowledge
#             - Keep response concise and focused
#             - only output the Response Part while answer
#             - mathematical equations should start with $$ and end with $$ 
#             - not need to output "## Response"
            
#             Final Answer:
#             """
        
#         prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
#         prompt = prompt_template.format(context=context_text, query=query_text)
        
#         logger.info("Generating final response")
#         return Response(
#             generate(model2, prompt),
#             mimetype='text/event-stream',
#             headers={
#                 'Cache-Control': 'no-cache',
#                 'Connection': 'keep-alive',
#                 'Access-Control-Allow-Origin': '*'
#             }
#         )
        
#     except Exception as e:
#         logger.error(f"Error in conditional RAG pipeline: {str(e)}")
#         error_message = f"An error occurred: {str(e)}"
#         return Response(
#             f"data: {error_message}\n\n",
#             mimetype='text/event-stream',
#             headers={
#                 'Cache-Control': 'no-cache',
#                 'Connection': 'keep-alive',
#                 'Access-Control-Allow-Origin': '*'
#             }

#         ) 






def QuestionAnswerUsingContent():
    data = request.get_json() # data come as json object
    dict_data = dict(data)
    query_text = dict_data['query_text']
    unique_id = dict_data['unique_id']
    context = dict_data['context']
    resume_context = dict_data['resume_context']
    messages = dict_data.get('messages', [])  # Get messages from frontend
   
    logger.info(f"Processing query: {query_text}")
    
    try:
        # Use the provided context directly (previous message history)
        context_text = context if context else ""
        
        # Get resume context (primary focus for answers)
        resume_context_text = resume_context if resume_context else ""
        
        # Format previous messages for context
        conversation_history = ""
        if messages:
            conversation_history = "\n\n".join([
                f"{'User' if msg['type'] == 'user' else 'Assistant'}: {msg['content']}"
                for msg in messages
            ])
        
        # RESPONSE GENERATION using provided context
        model2 = get_chat_model(model_name="gpt-4o", temperature=0.4, streaming=True)
        
        PROMPT_TEMPLATE = """
        **RESUME CONTEXT** (PRIMARY FOCUS - ALWAYS PRIORITIZE THIS):
        {resume_context}
        
        **CONVERSATION CONTEXT** (Previous message history for reference only):
        Previous conversation:
        {conversation_history}
        
        **CURRENT QUERY**:
        {query}
        
        **TOPIC SCOPE - ALLOWED CONVERSATIONS**:
        You are a career and resume assistant. You can ONLY discuss topics related to:
        - Resume content, structure, and optimization
        - Career advice, career planning, and career development
        - Job search strategies and interview preparation
        - Skills assessment and skill development
        - Professional growth and career transitions
        - Educational background and professional qualifications
        - Work experience and achievements
        - Industry insights related to the user's career field
        - Any topic directly related to the user's professional journey and career advancement
        
        **IRRELEVANT TOPIC HANDLING**:
        If the user asks about anything NOT related to resume, career, or professional development (such as general knowledge questions, current events, entertainment, unrelated technical topics, etc.), you MUST politely and respectfully respond with:
        "We can't talk anything unrelavent. Please ask me about your resume, career, or professional development."
        
        **RESPONSE STRATEGY**:
        1. **TOPIC CHECK FIRST**: Before answering, determine if the query is related to resume, career, or professional development. If not, use the irrelevant topic response above.
        2. **ALWAYS FOCUS ON RESUME CONTEXT FIRST**: The resume context contains the user's professional information. Always prioritize answering based on the resume context provided above. This is the primary source of truth for answering questions about the user's background, skills, experience, and qualifications.
        3. **Previous Message Context**: Use previous conversation history only to understand the flow of the conversation, but always ground your answers in the resume context.
        4. **General Career Knowledge**: Only use general career knowledge if the query cannot be answered from the resume context but is still career-related.
        5. **Unclear Query**: If you don't understand the query or it's ambiguous, respectfully reply "I don't understand your question. Could you please rephrase it?"
        
        **RESPONSE GUIDELINES**:
        - ALWAYS check if the topic is relevant to resume/career first
        - ALWAYS focus on and reference the resume context when answering career-related questions
        - Keep responses concise and focused
        - Use mathematical equations with $$ and end with $$ 
        - Be helpful and informative
        - When answering, cite specific information from the resume context
        - If the query relates to the user's background, skills, or experience, base your answer entirely on the resume context
        
        **Final Answer**:
        """
        
        prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
        prompt = prompt_template.format(
            resume_context=resume_context_text,
            conversation_history=conversation_history,
            context=context_text, 
            query=query_text
        )
        
        logger.info("Generating final response")
        return Response(
            generate(model2, prompt),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*'
            }
        )
        
    except Exception as e:
        logger.error(f"Error in RAG pipeline: {str(e)}")
        error_message = f"An error occurred: {str(e)}"
        return Response(
            f"data: {error_message}\n\n",
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*'
            }
        )    





#         model1 = get_chat_model()    
      

#         embeddings =get_embedding_model()
#         print("second time")
        
#         vectorstore = PineconeVectorStore.from_existing_index(
#             index_name=index_name,
#             embedding=embeddings
#         )
#         print(unique_id)
#         print("3rd time")
#         # Perform similarity search
#         results = vectorstore.similarity_search(
#             query=query_text,
#             k=2,
#              filter={
#                 "unique_id": unique_id # Replace with your metadata fields
#           }

#         )
#         print("ok1")
#         print(results)
#             # Filter results by unique_id (which is video_id in your context)
#         # filtered_results = [doc for doc in results if doc.metadata['unique_id'] == unique_id]
#         # print(filtered_results)
        
#         # Extract the context from the filtered results
#         context_text = "\n\n---\n\n".join([doc.page_content for doc in results])
#         print(context_text)
      

#         model2 = get_chat_model(model_name="gpt-4o",temperature = 0,streaming = True )  
#         print("oke2")
     
#         PROMPT_TEMPLATE = """
# **STRUCTURE TEMPLATE**:
# ## Analysis
# - Understand context first: {context}
# - Identify key question elements: {query}
#     ## Response Strategy
#     "If context is empty or you don't understand the query ": "Ask ONE clarifying question to: 1) Identify specific needs 2) Narrow scope 3) Request examples",
#     "if context has : try to answer based on the context " 
#     Use LaTeX syntax with $...$ for inline math and $$...$$ for display math. For complex equations, use \\begin before equation...\\ end after equation.
#    - Answer simple ,short, concise format
#    - output the final answer not need to output the condition 

# Final Answer:
# """
#         prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
#         prompt = prompt_template.format(context=context_text,query=query_text)
#         print("oke3")
#         # response_text = llm.stream(prompt)
#         # print(response_text.content)
#         return Response(
#             generate(model2,prompt),
#             mimetype='text/event-stream',
#             headers={
#             'Cache-Control': 'no-cache',
#             'Connection': 'keep-alive',
#             'Access-Control-Allow-Origin': '*'
#             }
#         )
#     except Exception as e:  
#         return jsonify({"error": str(e)}), 500 