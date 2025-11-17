import os
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

def openai_instance(model_name,temperature,streaming=False):
    callbacks = [StreamingStdOutCallbackHandler()] if streaming else []
    # Instead of waiting for the entire response to be generated, callbacks
    #  allow you to process tokens as they arrive, reducing latency
    return ChatOpenAI(
        model_name=model_name,
        temperature=temperature,
        openai_api_key=os.environ.get("OPENAI_API_KEY"),
        streaming=streaming,
        callbacks=callbacks , # Pass the appropriate callbacks list
        verbose=True
    )
def openai_embedding_instance(model):
    return  OpenAIEmbeddings(
    openai_api_key=os.environ.get("OPENAI_API_KEY"),
    model=model,
    )