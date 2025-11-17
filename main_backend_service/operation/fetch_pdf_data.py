import fitz  # PyMuPDF
from flask import jsonify
import requests
import io
from operation.image_process import image_process
from operation.store_in_vectordb import storedb

def fetch_pdf_data(pdf_url,chat_id):
    pdf_file = pdf_url
    print("fetch pdf",pdf_file)
    # socketio.emit("pdf-extracting")
    text , images = extract_text(pdf_file)
    # socketio.emit("image-processing")
    summarywithpage = []
    if(images):
      summarywithpage = image_process(images)
    # socketio.emit("storing-in-db")
    vectorstore, context= storedb(text,summarywithpage,chat_id)
    # socketio.emit("storing-is-complete")
    return vectorstore, context
    
    
    
    # return text,summarywithpage 

def download_pdf(pdf_url):
        """Download PDF from URL"""
        response = requests.get(pdf_url)
        return io.BytesIO(response.content)


# Open the PDF

def extract_text(pdf_url):
        """Extract text from PDF"""
        pdf_file = download_pdf(pdf_url)
        doc = fitz.open(stream=pdf_file)
        text = []
        images = []
        i = 1
        print("now we are here 1")
        for page in doc:
          text_content = page.get_text()
          if text_content:
           text.append({
            "page_number": i,
            "text": text_content
           })

    # Extract images
          for img_index, img in enumerate(page.get_images(full=True)):
            xref = img[0]  # The xref for the image
            base_image = doc.extract_image(xref)  # Extract the image data
            images.append({
            "page_number": i ,
            "image": {
                "xref": xref,
                "base64": base_image["image"],  # Raw image bytes
                "width": base_image["width"],
                "height": base_image["height"],
                "ext": base_image["ext"]  # Image extension (e.g., 'png', 'jpeg')
             }
           })

          i = i + 1
        return text,images

