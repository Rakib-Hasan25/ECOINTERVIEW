import os
import json
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from constant.all_prompt import RESUME_SUGGESTIONS_PROMPT

def generate_resume_suggestions(resume_context, preferred_career_track):
    """
    Generate professional summary, suggestions, and bullet points for a resume based on context and career track.
    
    Args:
        resume_context (str): The user's resume context
        preferred_career_track (str): User's preferred career track
        
    Returns:
        dict: A dictionary containing:
            - professional_summary (str): A compelling professional summary
            - suggestions (list): Array of actionable suggestions for improving the resume
            - bullet_points (list): Array of strong bullet points for projects/experience
    """
    try:
        # Create prompt template
        prompt_template = ChatPromptTemplate.from_template(RESUME_SUGGESTIONS_PROMPT)
        prompt = prompt_template.format(
            resume_context=resume_context,
            preferred_career_track=preferred_career_track
        )

        # Use ChatOpenAI with JSON mode
        llm = ChatOpenAI(
            model_name="gpt-4o",
            temperature=0.3,
            streaming=False,
            max_tokens=2000,
            openai_api_key=os.environ.get('OPENAI_API_KEY'),
            model_kwargs={"response_format": {"type": "json_object"}}
        )

        # Generate response
        response = llm.invoke(prompt)

        # Parse JSON response
        try:
            result = json.loads(response.content)
            
            # Validate and ensure correct types
            professional_summary = str(result.get("professional_summary", ""))
            suggestions = result.get("suggestions", [])
            bullet_points = result.get("bullet_points", [])
            
            # Ensure arrays are lists
            if not isinstance(suggestions, list):
                suggestions = [suggestions] if suggestions else []
            if not isinstance(bullet_points, list):
                bullet_points = [bullet_points] if bullet_points else []
            
            # Ensure all items in lists are strings
            suggestions = [str(s) for s in suggestions if s]
            bullet_points = [str(bp) for bp in bullet_points if bp]
            
            return {
                "professional_summary": professional_summary,
                "suggestions": suggestions,
                "bullet_points": bullet_points
            }
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}, response content: {response.content}")
            raise Exception(f"Failed to parse AI response: {str(e)}")
        except Exception as e:
            print(f"Error processing response: {e}")
            raise e

    except Exception as e:
        import traceback
        print(f"Error in generate_resume_suggestions: {str(e)}")
        print(traceback.format_exc())
        raise e

