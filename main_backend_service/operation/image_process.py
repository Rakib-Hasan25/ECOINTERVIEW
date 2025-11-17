
import io
import os
from flask import Response
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
import os
from langchain.schema import StrOutputParser
import base64
import io
from PIL import Image
import requests
from lib.openai_config  import openai_instance

def image_process(images):
    prompt_template = """
                        follow this format :
                        - Describe the image in details
                        - add proper markdown while answer
                        - Be specific about graphs, such as bar plots"""
    messages = [
    (
        "user",
        [
            {"type": "text", "text": prompt_template},
            {
                "type": "image_url",
                "image_url": {"url": "data:image/jpeg;base64,{image}"},
            },
        ],
    )
]   

    prompt = ChatPromptTemplate.from_messages(messages)

    summarywithpage = []
    try:
     model = openai_instance("gpt-4o-mini",0.3)
     chain = prompt | model | StrOutputParser()
     image_summaries = chain.batch([{"image":base64.b64encode(img['image']['base64']).decode("utf-8") } for img in images])
     print("Image summaries",image_summaries)
    except Exception as e:
       print("Error processing", e) 
       raise Exception("Error processing")
       
    for index,img in enumerate(image_summaries):
        summarywithpage.append({"page_number":images[index]['page_number'],
                                "summary":img
                                })
    return summarywithpage

def single_image_process(image,latest_msg):
    print("we reach to processing ")
    prompt_template = f"""
                        - Describe the image in short, concise, easy format
                        - no markdown pure text 
                        - Be specific about graphs, such as bar plots
                        - try to answer in 3 lines 
                    
                   ."""
    messages = [
    (
        "user",
        [
            {"type": "text", "text": prompt_template},
            {
                "type": "image_url",
                "image_url": {"url": "data:image/jpeg;base64,{image}"},
            },
        ],
    )
]   
    prompt = ChatPromptTemplate.from_messages(messages)

    try:
     model = openai_instance("gpt-4o-mini",0.3)
     chain = prompt | model | StrOutputParser()
     return chain.invoke({"image":image })
     
    except Exception as e:
       print("Error processing", e) 
       raise Exception("Error processing")
  
    

def download_image(image_url):
     response = requests.get(image_url)
     return io.BytesIO(response.content)  


def encode_image_to_base64(file_data):
    """Convert an image file (BytesIO) to a base64 string"""
    image = Image.open(file_data)  # Open image from BytesIO
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")  # Save image in PNG format
    buffer.seek(0)

    return base64.b64encode(buffer.getvalue()).decode("utf-8")