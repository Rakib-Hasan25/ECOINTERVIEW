import os
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

def get_chat_model(model_name="gpt-3.5-turbo",temperature = 0,streaming = False ):
 llm = ChatOpenAI(
            model_name=model_name,
            temperature=temperature,
            openai_api_key=os.environ.get('OPENAI_API_KEY'),
            streaming=streaming,
        )
 return llm

def get_llm_model_morefeatures(model_name="gpt-3.5-turbo",temperature = 0,streaming = False, max_tokens=2000, top_p=0.9, frequency_penalty=0.5, presence_penalty=0.5, response_format={"response_format": {"type": "text"}} ):
 llm = ChatOpenAI(
            model_name=model_name,
            temperature=temperature,
            max_tokens= max_tokens,  
            top_p=top_p, 
            frequency_penalty=frequency_penalty,  
            presence_penalty=presence_penalty,
            openai_api_key=os.environ.get('OPENAI_API_KEY'),
            streaming=streaming,
            # model_kwargs=response_format,
        )
 return llm


def get_embedding_model(model="text-embedding-ada-002" ):
 embeddings = OpenAIEmbeddings(
           model=model,
            openai_api_key=os.environ.get('OPENAI_API_KEY')
        )
 return embeddings