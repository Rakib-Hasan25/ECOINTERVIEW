import os
from flask import Response, request
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv 
from constant.all_prompt import BASIC_QUERY_PROMPT, PREVIOUS_CONTEXT_QUERY_PROMPT, ASK_FROM_IMAGE_PROMPT, ASK_FROM_PDF_PROMPT, ASK_FROM_PREVIOUS_STORE_FILE_PROMPT
from lib.get_specific_model import get_llm_model_morefeatures

load_dotenv() 

def generate(llm,prompt):
    for chunk in llm.stream(prompt):
        if hasattr(chunk, 'content'):
            yield f"{chunk.content}"

def dummy_error_response():
    error_message = "Server is busy, please try again later"
    yield error_message

def generate_streaming_response():
    try:
        data = request.get_json() # data come as json object
        dict_data = dict(data)
        msg = dict_data['query_text']
        context = dict_data['context']
        request_type = dict_data['request_type']
        print("context",context)
        print("request_type",request_type)

       
        prompt_text = ""    
        if request_type == "previous-context-query":
            prompt_text = PREVIOUS_CONTEXT_QUERY_PROMPT
        elif request_type == "image-query":
            prompt_text = ASK_FROM_IMAGE_PROMPT

        elif request_type == "pdf-query":
            prompt_text = ASK_FROM_PDF_PROMPT

        elif request_type == "ask-previous-store-file":
            prompt_text = ASK_FROM_PREVIOUS_STORE_FILE_PROMPT
        else:
            prompt_text = BASIC_QUERY_PROMPT

        prompt_template = ChatPromptTemplate.from_template(prompt_text)
        model = get_llm_model_morefeatures(
            model_name="gpt-4o", 
            temperature=0.4,
            streaming=True, 
            max_tokens=300, 
            frequency_penalty=0.1, 
            presence_penalty=0.1
        )

        prompt = ""
        if request_type == "previous-context-query" or request_type == "ask-previous-store-file" or request_type == "image-query" or request_type == "pdf-query":
            # Truncate context if longer than 1000 chars
            truncated_context = context[:1000] if len(str(context)) > 1000 else context
            prompt = prompt_template.format(context=truncated_context, query=msg)

        else:
            prompt = prompt_template.format(query=msg)

        return Response(
            generate(model,prompt),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*'
            }
        )
    except Exception as e:
        print(f"Error in generate_streaming_response: {str(e)}")
        return Response(
            dummy_error_response(),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*'
            }
        )  
           
        
      
        
        

# def generate_streaming_response_previous_context(msg, latest_msg):

        

#         prompt_text = """
#         you are an expert. 
#         These are our previous conversations history {msg}.
#         follow the below steps while answer 
#         - answer should be short ,concise, straightforward, simple. 
#         - add proper markdown while answer
#         Question : 
#         {element}
#         """
#         prompt = ChatPromptTemplate.from_template(prompt_text)

#         print("prompt",prompt)
#         print("================================================")
#         model = ChatOpenAI(
#             model_name="gpt-4o",
#             temperature=0.2,
#             openai_api_key=os.environ.get('OPENAI_API_KEY'),
#             streaming=True,
#             callbacks=[StreamingStdOutCallbackHandler()],
#             verbose=True
#         )
#         summarize_chain =  {"msg": lambda x: x}| {"element": lambda x: x} | prompt | model | StrOutputParser()
        
#         return summarize_chain.stream({ "msg": msg,
#         "element": latest_msg})
               