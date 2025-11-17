import os
import json
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

SKILLS_EXTRACTION_PROMPT = """
You are an expert resume analyst. Read the provided context and extract the key technical or professional skills mentioned.

Respond ONLY in valid JSON format with this exact structure:
{{"skills": ["skill_one", "skill_two", "skill_three"]}}

Extract only the technical and professional skills. Return an empty array if no skills are found.

Context:
{context}
"""

def extract_skills_from_context(context):
    """
    Extract skills from a given context using OpenAI.
    
    Args:
        context (str): The context/text from which to extract skills
        
    Returns:
        list: A list of extracted skills (strings)
    """
    try:
        if not context or not context.strip():
            return []

        # Create prompt template
        prompt_template = ChatPromptTemplate.from_template(SKILLS_EXTRACTION_PROMPT)
        prompt = prompt_template.format(context=context)

        # Use ChatOpenAI with JSON mode
        llm = ChatOpenAI(
            model_name="gpt-4o-mini",
            temperature=0,
            streaming=False,
            max_tokens=500,
            openai_api_key=os.environ.get('OPENAI_API_KEY'),
            model_kwargs={"response_format": {"type": "json_object"}}
        )

        # Generate response
        response = llm.invoke(prompt)

        # Parse JSON response
        try:
            extracted = json.loads(response.content)
            raw_skills = extracted.get("skills", [])
        except json.JSONDecodeError as e:
            # If JSON parsing fails, log and return empty list
            print(f"JSON parsing error: {e}, response content: {response.content}")
            raw_skills = []
        except Exception as e:
            print(f"Error extracting skills from JSON: {e}")
            raw_skills = []

        # Clean and validate skills
        skills = [
            str(skill).strip() for skill in raw_skills
            if isinstance(skill, str) and skill.strip()
        ]

        return skills

    except Exception as e:
        import traceback
        print(f"Error in extract_skills_from_context: {str(e)}")
        print(traceback.format_exc())
        raise e

