import os
import uuid
import sys
from pathlib import Path
from operation.langvectoroperation import QuestionAnswerUsingContent
from flask import Flask, json, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import requests
from dotenv import load_dotenv
load_dotenv()  # Load from current directory
from lib.openai_config import openai_embedding_instance
from operation.fetch_pdf_data import fetch_pdf_data
from operation.generic_streaming_operation import generate_streaming_response
from operation.llm_operation_vector_db import operation_with_vectordb
from operation.format_resume_context import format_resume_context
from operation.extract_skills import extract_skills_from_context
from operation.job_resume_match import match_job_with_resume
from operation.analyze_skill_gaps import analyze_skill_gaps
from operation.generate_career_roadmap import generate_career_roadmap
from operation.fetch_youtube_videos import fetch_youtube_videos
from operation.generate_resume_suggestions import generate_resume_suggestions
from operation.protfolio_scrap import analyze_portfolio
from redis import Redis
from lib.openai_config import openai_embedding_instance
from langchain_community.vectorstores import SupabaseVectorStore
from lib.supabase_config import supabase,BUCKET_NAME
from operation.image_process import download_image,encode_image_to_base64,single_image_process
import aiohttp
import asyncio
from lib.get_specific_model import get_llm_model_morefeatures

class LLMChatServer:
    def __init__(self):
        # Initialize Flask app with CORS
        self.app = Flask(__name__)
        CORS(self.app, resources={
            r"/api/*": {"origins": "*"},
            r"/socket.io/*": {"origins": "*"}
        })
        self.socketio = SocketIO(self.app, cors_allowed_origins="*")
        self.register_routes()
        self.register_socket_events()
        redis_host = os.getenv('REDIS_HOST', 'redis')  
        redis_port = int(os.getenv('REDIS_PORT', 6379))
        
        # Initialize Redis client with explicit host and port
        # try:
        #     self.redis_client = Redis(
        #         host=redis_host,
        #         port=redis_port,
        #         ssl=False,  # Disable SSL for local development
        #         decode_responses=True,  # Optional: automatically decode responses to strings
        #         socket_timeout=5,  # Add timeout
        #         socket_connect_timeout=5  # Add connection timeout
        #     )
        #     # Test the connection
        #     self.redis_client.ping()
        #     print("Successfully connected to Redis")
        # except Exception as e:
        #     print(f"Failed to connect to Redis: {e}")
        #     self.redis_client = None
        

   




   # Define the API routes(http)
    def register_routes(self):
        @self.app.route('/api/get-learning-resources', methods=['GET'])
        def get_learning_resources():
            try:
                # data = request.get_json()
                # platform = data.get('platform')
                return jsonify({"message": "Learning resources fetched successfully"}), 200
            except Exception as e:
                return jsonify({"error": str(e)}), 500



        @self.app.route('/api/get-resume-context', methods=['POST'])
        def get_learning_resours():
            try:
                data = request.get_json()
                file_url = data.get('fileurl')
                file_type = data.get('filetype')
                chat_id = data.get('chatId')
                if file_type == 'pdf':
                    vector_store, context = fetch_pdf_data(file_url, chat_id)
                    formatted_resume = format_resume_context(context)
                
                     
                
                
                
                elif file_type == 'image':
                    context = single_image_process(file_url, chat_id)
                else:
                    return jsonify({"error": "Invalid file type"}), 400
                return jsonify({"message": "Resume context fetched successfully ","context":formatted_resume}), 200
            except Exception as e:
                return jsonify({"error": str(e)}), 500

        @self.app.route('/api/format-resume-context', methods=['POST'])
        def format_resume():
            try:
                data = request.get_json()
                resume_context = data.get('resume_context')
                
                if not resume_context:
                    return jsonify({"error": "resume_context is required"}), 400
                
                formatted_resume = format_resume_context(resume_context)
                
                return jsonify({
                    "message": "Resume formatted successfully",
                    "formatted_resume": formatted_resume
                }), 200
            except Exception as e:
                return jsonify({"error": str(e)}), 500

        @self.app.route('/api/question-answer-with-content',methods=['post'])  
        def query_with_content():  
            return QuestionAnswerUsingContent() 




        
        @self.app.route('/api/extract-skills', methods=['POST'])
        def extract_skills():
            try:
                data = request.get_json() or {}
                context = data.get('context', '')

                if not context or not context.strip():
                    return jsonify({"error": "context is required"}), 400

                # Extract skills using the operation function
                skills = extract_skills_from_context(context)

                return jsonify({
                    "skills": skills
                }), 200
            except Exception as e:
                import traceback
                error_msg = str(e)
                print(f"Error in extract_skills route: {error_msg}")
                print(traceback.format_exc())
                return jsonify({"error": error_msg}), 500
        
        @self.app.route('/api/match-job-resume', methods=['POST'])
        def match_job_resume():
            try:
                data = request.get_json() or {}
                
                # User information
                resume_context = data.get('resume_context', '')
                preferred_track = data.get('preferred_track', '')
                experience_level = data.get('experience_level', '')
                
                # Job information
                job_title = data.get('job_title', '')
                company = data.get('company', '')
                locations = data.get('locations', '')
                required_skills = data.get('required_skills', '')
                job_experience_level = data.get('job_experience_level', '')
                job_type = data.get('job_type', '')
                
                # Validate required fields
                if not resume_context or not resume_context.strip():
                    return jsonify({"error": "resume_context is required"}), 400
                
                if not job_title or not job_title.strip():
                    return jsonify({"error": "job_title is required"}), 400
                
                # Call the matching operation
                result = match_job_with_resume(
                    resume_context=resume_context,
                    preferred_track=preferred_track,
                    user_experience_level=experience_level,
                    job_title=job_title,
                    company=company,
                    locations=locations,
                    required_skills=required_skills,
                    job_experience_level=job_experience_level,
                    job_type=job_type
                )
                
                return jsonify(result), 200
                
            except Exception as e:
                import traceback
                error_msg = str(e)
                print(f"Error in match_job_resume route: {error_msg}")
                print(traceback.format_exc())
                return jsonify({"error": error_msg}), 500
        
        @self.app.route('/api/analyze-skill-gaps', methods=['POST'])
        def analyze_skill_gaps_route():
            try:
                data = request.get_json() or {}
                
                # Get required parameters
                resume_context = data.get('resume_context', '')
                career_track = data.get('career_track', '')
                experience_level = data.get('experience_level', '')
                user_id = data.get('user_id', '')
                
                # Validate required fields
                if not resume_context or not resume_context.strip():
                    return jsonify({"error": "resume_context is required"}), 400
                
                if not career_track or not career_track.strip():
                    return jsonify({"error": "career_track is required"}), 400
                
                if not experience_level or not experience_level.strip():
                    return jsonify({"error": "experience_level is required"}), 400
                
                if not user_id or not user_id.strip():
                    return jsonify({"error": "user_id is required"}), 400
                
                # Check if skillgaps already exists in database
                try:
                    from lib.supabase_config import supabase
                    existing_data = supabase.table("job_seekers").select("skillgaps").eq("id", user_id).single().execute()
                    
                    if existing_data.data and existing_data.data.get("skillgaps"):
                        # Return existing skillgaps
                        return jsonify({
                            "detailed_analysis": existing_data.data.get("skillgaps", "")
                        }), 200
                except Exception as db_error:
                    # If no data found or error, continue to generate
                    print(f"Database check error (will generate new): {str(db_error)}")
                
                # Generate new skill gap analysis
                result = analyze_skill_gaps(
                    resume_context=resume_context,
                    career_track=career_track,
                    experience_level=experience_level
                )
                
                detailed_analysis = result.get("detailed_analysis", "")
                
                # Store the generated skillgaps in database
                try:
                    from lib.supabase_config import supabase
                    supabase.table("job_seekers").update({
                        "skillgaps": detailed_analysis
                    }).eq("id", user_id).execute()
                    print(f"Successfully stored skillgaps for user {user_id}")
                except Exception as store_error:
                    print(f"Error storing skillgaps in database: {str(store_error)}")
                    # Continue even if storage fails - we still return the result
                
                # Return the detailed_analysis
                return jsonify({
                    "detailed_analysis": detailed_analysis
                }), 200
                
            except Exception as e:
                import traceback
                error_msg = str(e)
                print(f"Error in analyze_skill_gaps_route: {error_msg}")
                print(traceback.format_exc())
                return jsonify({"error": error_msg}), 500
        
        @self.app.route('/api/generate-career-roadmap', methods=['POST'])
        def generate_career_roadmap_route():
            try:
                data = request.get_json() or {}
                
                # Get required parameters
                skill_gaps = data.get('skill_gaps', '')
                preferred_career_track = data.get('preferred_career_track', '')
                timeframe = data.get('timeframe', '')
                
                # Validate required fields
                if not skill_gaps or not skill_gaps.strip():
                    return jsonify({"error": "skill_gaps is required"}), 400
                
                if not preferred_career_track or not preferred_career_track.strip():
                    return jsonify({"error": "preferred_career_track is required"}), 400
                
                if not timeframe or not timeframe.strip():
                    return jsonify({"error": "timeframe is required"}), 400
                
                # Generate career roadmap
                result = generate_career_roadmap(
                    skill_gaps=skill_gaps,
                    preferred_career_track=preferred_career_track,
                    timeframe=timeframe
                )
                
                return jsonify(result), 200
                
            except Exception as e:
                import traceback
                error_msg = str(e)
                print(f"Error in generate_career_roadmap_route: {error_msg}")
                print(traceback.format_exc())
                return jsonify({"error": error_msg}), 500
        
        @self.app.route('/api/youtube-search', methods=['POST'])
        def youtube_search_route():
            try:
                data = request.get_json() or {}
                
                # Get required parameters
                query = data.get('query', '')
                
                # Validate required fields
                if not query or not query.strip():
                    return jsonify({"error": "query is required"}), 400
                
                # Fetch YouTube videos
                videos = fetch_youtube_videos(search_query=query)
                
                # Return videos in format expected by frontend
                return jsonify(videos), 200
                
            except Exception as e:
                import traceback
                error_msg = str(e)
                print(f"Error in youtube_search_route: {error_msg}")
                print(traceback.format_exc())
                return jsonify({"error": error_msg}), 500
        
        @self.app.route('/api/generate-resume-suggestions', methods=['POST'])
        def generate_resume_suggestions_route():
            try:
                data = request.get_json() or {}
                
                # Get required parameters
                resume_context = data.get('resume_context', '')
                preferred_career_track = data.get('preferred_career_track', '')
                
                # Validate required fields
                if not resume_context or not resume_context.strip():
                    return jsonify({"error": "resume_context is required"}), 400
                
                if not preferred_career_track or not preferred_career_track.strip():
                    return jsonify({"error": "preferred_career_track is required"}), 400
                
                # Generate resume suggestions
                result = generate_resume_suggestions(
                    resume_context=resume_context,
                    preferred_career_track=preferred_career_track
                )
                
                return jsonify(result), 200
                
            except Exception as e:
                import traceback
                error_msg = str(e)
                print(f"Error in generate_resume_suggestions_route: {error_msg}")
                print(traceback.format_exc())
                return jsonify({"error": error_msg}), 500
        
        @self.app.route('/api/analyze-portfolio', methods=['POST'])
        def analyze_portfolio_route():
            try:
                data = request.get_json() or {}
                
                # Get required parameters
                portfolio_url = data.get('portfolio_url', '')
                
                # Validate required fields
                if not portfolio_url or not portfolio_url.strip():
                    return jsonify({"error": "portfolio_url is required"}), 400
                
                # Analyze portfolio and get recommendations
                result = analyze_portfolio(portfolio_url=portfolio_url)
                
                # Extract only detailed_analysis and improvements
                recommendations = result.get('recommendations', {})
                response_data = {
                    "detailed_analysis": recommendations.get('detailed_analysis', ''),
                    "improvements": recommendations.get('improvements', [])
                }
                
                return jsonify(response_data), 200
                
            except Exception as e:
                import traceback
                error_msg = str(e)
                print(f"Error in analyze_portfolio_route: {error_msg}")
                print(traceback.format_exc())
                return jsonify({"error": error_msg}), 500
        
        

        


        
        
        
        # @self.app.route('/api/upload', methods=['POST'])
        # def upload_file():
        #     file = request.files['file']
        #     file_type = request.form['filetype']
        #     file_id = request.form['fileId']
        #     chunk_number = int(request.form['chunkNumber'])
        #     total_chunks = int(request.form['totalChunks'])
        #     chunk_filename = f"{file_id}_part_{chunk_number}"

        #     try:
        #     # Upload the chunk to Supabase Storage
        #         supabase.storage.from_(BUCKET_NAME).upload(
        #         path=chunk_filename,
        #         file=file.read(),
        #         file_options={"content-type": "application/octet-stream"}
        #     ) 
        #         print("chunk uploaded successfully")
        #     except Exception as e:
        #         return jsonify({"error": str(e)}), 500

        #     # If all chunks are uploaded, combine them
        #     if chunk_number == total_chunks - 1:
        #      print("we are in the last chunk")   
        #      try:
        #         # Combine all chunks
        #         combined_file = b""
        #         for i in range(total_chunks):
        #          chunk_filename = f"{file_id}_part_{i}"
        #          chunk_data = supabase.storage.from_(BUCKET_NAME).download(chunk_filename)
        #          combined_file += chunk_data
        #         print("file type ", file_type)    
        #         # Determine final file name and type
        #         if file_type =='image':
        #             final_filename = f"{file_id}_final.png"
        #             content_type = "image/png"
        #         else:
        #             final_filename = f"{file_id}_final.pdf"
        #             content_type = "application/pdf"
              
                 

        #         # Upload the combined file to Supabase Storage
        #         supabase.storage.from_(BUCKET_NAME).upload(
        #         path=final_filename,
        #         file=combined_file,
        #         file_options={"content-type": content_type}
        #         )

        #         # Clean up the chunks
        #         for i in range(total_chunks):
        #          chunk_filename = f"{file_id}_part_{i}"
        #          supabase.storage.from_(BUCKET_NAME).remove([chunk_filename])

        #         # Generate public URL for the uploaded file
        #         file_url = supabase.storage.from_(BUCKET_NAME).get_public_url(final_filename)
        #         return jsonify({"message": "File uploaded successfully", "data": file_url}), 200
        #      except Exception as e:
        #         return jsonify({"error": str(e)}), 500
          
        #     return jsonify({"message": "chunk upload successfull"}), 200
            
        # @self.app.route('/api/delete-file', methods=['POST'])
        # def delete_file():
        #     try:
        #         data = request.get_json()
        #         file_name = data.get('fileName')
        #         file_type = data.get('fileType')
            
        #         if file_type == 'image/png':
        #            file_name += "_final.png"
        #         else:
        #           file_name += "_final.pdf"
        #         if not file_name:
        #           return jsonify({"error": "File name is required"}), 400

        #     # Remove the file from Supabase Storage
        #         response = supabase.storage.from_(BUCKET_NAME).remove([file_name])
        #         if response.get('error'):
        #           return jsonify({"error": "Failed to delete file"}), 500

        #         return jsonify({"message": "File deleted successfully"}), 200
        #     except Exception as e:
        #         return jsonify({"error": str(e)}), 500
          

        # @self.app.route('/api/chat', methods=['POST'])
        # def http_chat():
        #     return generate_streaming_response()
           







#define the socket events

    def register_socket_events(self):
        @self.socketio.on('connect')
        def handle_connect():
            print('Client connected')







    #     #basic msg handling
    #     #we are not using this function anymore (can create unusal chunk while sending msg)

    #     @self.socketio.on('normal-msg')
    #     def text_msg(data):

    #         print('client sending message')    
    #         message = data.get('message')
    #         print(message)
    #         # response = generate_response(message)
    #         # emit('stream_chunk', {
    #         #     'content': response
    #         # })
            
    #     #Previous Context msg handling
    #     @self.socketio.on('previous-context-msg')
    #     def text_msg(data): 
    #         msg = data.get('message')
    #         latest_msg = msg[-1]["content"]
    #         print(latest_msg)
    #         if(len(msg)>10):
    #             msg = msg[-9:-1]
    #         elif(len(msg) < 10):
    #             msg = msg[:-1]
    #         emit("get_context",{
    #             "context":msg
    #         })    
            
        
       
    

    #    #pdf scraping as well as send msg 
    #    #image processing as well as send msg 
    #     @self.socketio.on('msg-with-upload-file')
    #     def msg_with_file(data):
    #         file_url = data.get('fileurl')
    #         msg = data.get('message')
    #         file_type = data.get('filetype')
    #         chat_id = data.get('chatId')
    #         latest_msg = msg
    #         try:
    #           if(file_type):
    #             #if file type is pdf 
    #             print('file is pdf')
    #             vector_store, context = fetch_pdf_data(file_url, self.socketio,chat_id)
                
    #             emit("get_context_file",{
    #                 "context":context
    #             })
    #           else:
    #             #if file type is image 
    #             emit('image_processing')
    #             download_image1 = download_image(file_url)
    #             print('downloading image')
    #             image = encode_image_to_base64(download_image1)
    #             emit("analyzing-msg-text")
    #             context = single_image_process(image, latest_msg)
    #             emit("get_context_file",{
    #                 "context":context
    #             })
    #           emit("stream_generating_file")

    #         except Exception as e:
    #            print("something went wrong",e )
    #            emit("get_context_file",{
    #                 "context":[]
    #             })   
           
               
        
        
        
        
    #     #chat with previously uploaded file in vector db 
    #     @self.socketio.on('chat-with-file')
    #     def chat_with_pdf(data):
    #         msg = data.get('message')
    #         latest_msg = msg
    #         chat_id = data.get('chatId')
    #         embeddings= openai_embedding_instance(model="text-embedding-ada-002")
    #         try:    
    #           vector_store = SupabaseVectorStore(
    #           embedding=embeddings,
    #           client=supabase,
    #           table_name="documents",
    #           query_name="match_documents",
    #           )
    #           operation_with_vectordb(vector_store,latest_msg,self.socketio,chat_id)
    #         except Exception as e:
    #           print("something went wrong",e )
            
            
         
            



 



    #     @self.socketio.on("websearch-chat")
    #     def websearch_chat(data):        
    #         msg = data.get('message')
    #         latest_msg = msg
        
    #         prompt_template = """
    #         Classify the following user query into one of: image, youtube, research_paper, or news.
    #         If it's about images, return {{\"request_type\": \"image\", \"query\": \"<short query>\"}}.
    #         If it's about YouTube, return {{\"request_type\": \"youtube\", \"query\": \"<short query>\"}}.
    #         If it's about research papers, return {{\"request_type\": \"research_paper\", \"query\": \"<short query>\"}}.
    #         Otherwise, return {{\"request_type\": \"news\", \"query\": \"<short query>\"}}.
    #         User query: {query}
    #         """
    #         prompt = ChatPromptTemplate.from_template(prompt_template).format(query=latest_msg)

    #         # 2. Get LLM and generate response
    #         llm = get_llm_model_morefeatures(model_name="gpt-4o", temperature=0.2, streaming=False, max_tokens=100,response_format={"response_format": {"type": "json_object"}})
    #         response = llm.invoke(prompt)
    #         print("LLM classification response:", response.content)
    #         request_type = "news"
    #         short_query = latest_msg
    #         try:
    #             classification = json.loads(response.content)
    #             request_type = classification.get("request_type")
    #             short_query = classification.get("query")
    #             print("i am here in the try block")
    #         except Exception as e:
    #             print("Classification failed, defaulting to news", e)
                
    #             short_query = latest_msg
    #             print("i am here in the except block")


    #         # 3. Route selection
    #         route_map = {
    #             "image": f"{os.getenv('NODE_BACKEND_URL')}/image-search",
    #             "youtube": f"{os.getenv('NODE_BACKEND_URL')}/youtube-search",
    #             "research_paper": f"{os.getenv('NODE_BACKEND_URL')}/paper-search",
    #             "news": f"{os.getenv('NODE_BACKEND_URL')}/news-search"
    #         }
    #         url = route_map.get(request_type)
    #         payload = {"query": short_query}
    #         print("url ",url)
    #         print(payload)
    #         headers = {"Content-Type": "application/json"}
    #         try:
    #             response = requests.post(url, json=payload, headers=headers)
    #             response.raise_for_status()
    #             print("Response:", response.json())
    #             data = response.json()
    #             result = data.get('videos') or data.get('images') or data.get('papers') or data.get('news') or []
    #             print("result ",result)
    #             if(result):    
    #                 # Format the result based on request_type
    #                 formatted_result = []
    #                 if request_type == 'youtube':
    #                     formatted_result = [{
    #                         'title': item['title'],
    #                         'img_src': item['img_src'],
    #                         'url': item['url'],
    #                         'iframe_src': item['iframe_src']
    #                     } for item in result]
    #                 elif request_type == 'image':
    #                     formatted_result = [{
    #                         'title': item['title'],
    #                         'img_src': item['img_src'],
    #                         'url': item['url']
    #                     } for item in result]
    #                 elif request_type == 'research_paper':
    #                     formatted_result = [{
    #                         'title': item['title'],
    #                         'url': item['url'],
    #                         'pdf_url': item.get('pdf_url')
    #                     } for item in result]
    #                 elif request_type == 'news':
    #                     formatted_result = [{
    #                         'title': item['title'],
    #                         'url': item['url'],
    #                         'content': item.get('content', '')
    #                     } for item in result]

    #                 emit("return-response", {
    #                     'result': formatted_result,
    #                     'request_type': request_type
    #                 })
    #                 emit("response-complete")
                
              
    #         except requests.exceptions.RequestException as e:
    #             print("Error:", e)
    #             emit("return-response", {
    #                     'result': "Server is busy, please try again later",
    #                     'request_type': "error"
    #                 })
       







    # #     @self.socketio.on('senttoredis')
    # #     def handle_senttoredis(data):
    #         message = data.get("message")
    #         user_email = data.get("userEmail")
    #         chat_id = data.get("chatId")
    #         redis_key = f"chat:messages:{user_email}:{chat_id}"

        
    #         self.redis_client.rpush(redis_key, json.dumps(message))

    #         print("successfully push to redis ")
    #         print(message,user_email,chat_id)
   

        
    def run(self, host='0.0.0.0', port=5001, debug=False):
        self.socketio.run(self.app, host=host, port=port, debug=debug, allow_unsafe_werkzeug=True)    
           
            

server = LLMChatServer()
app = server.app
if __name__ == '__main__':
    server = LLMChatServer() # can comment out while working on production mode
    app = server.app # can comment out while working on production mode
    server.run(debug=False)  # Enable debug mode with auto-reload for development
