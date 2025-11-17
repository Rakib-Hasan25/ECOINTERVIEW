import os
import json
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from constant.all_prompt import JOB_RESUME_MATCH_PROMPT

def match_job_with_resume(resume_context, preferred_track, user_experience_level, 
                          job_title, company, locations, required_skills, 
                          job_experience_level, job_type):
    """
    Match a resume with a job posting and return similarity analysis.
    
    Args:
        resume_context (str): The user's resume context
        preferred_track (str): User's preferred career track
        user_experience_level (str): User's experience level
        job_title (str): Job title
        company (str): Company name
        locations (str or list): Job locations
        required_skills (str or list): Required skills for the job
        job_experience_level (str): Required experience level for the job
        job_type (str): Type of job (e.g., full-time, part-time, contract)
        
    Returns:
        dict: A dictionary containing:
            - similarity_score (float): Percentage match (0-100)
            - justification (str): Detailed explanation of why this score was assigned
            - missing_skill (list): Array of missing skills
            - overlap_skill (list): Array of overlapping skills
            - should_apply (bool): Whether the user should apply
    """
    try:
        # Convert lists to strings if needed
        if isinstance(locations, list):
            locations = ", ".join(locations)
        if isinstance(required_skills, list):
            required_skills = ", ".join(required_skills)
        
        # Create prompt template
        prompt_template = ChatPromptTemplate.from_template(JOB_RESUME_MATCH_PROMPT)
        prompt = prompt_template.format(
            resume_context=resume_context,
            preferred_track=preferred_track,
            user_experience_level=user_experience_level,
            job_title=job_title,
            company=company,
            locations=locations,
            required_skills=required_skills,
            job_experience_level=job_experience_level,
            job_type=job_type
        )

        # Use ChatOpenAI with JSON mode
        llm = ChatOpenAI(
            model_name="gpt-4o",
            temperature=0.2,
            streaming=False,
            max_tokens=1500,
            openai_api_key=os.environ.get('OPENAI_API_KEY'),
            model_kwargs={"response_format": {"type": "json_object"}}
        )

        # Generate response
        response = llm.invoke(prompt)

        # Parse JSON response
        try:
            result = json.loads(response.content)
            
            # Validate and ensure correct types
            similarity_score = float(result.get("similarity_score", 0))
            justification = result.get("justification", "")
            missing_skill = result.get("missing_skill", [])
            overlap_skill = result.get("overlap_skill", [])
            should_apply = bool(result.get("should_apply", False))
            
            # Ensure justification is a string
            if not isinstance(justification, str):
                justification = str(justification) if justification else ""
            
            # Ensure arrays are lists
            if not isinstance(missing_skill, list):
                missing_skill = [missing_skill] if missing_skill else []
            if not isinstance(overlap_skill, list):
                overlap_skill = [overlap_skill] if overlap_skill else []
            
            # Ensure similarity_score is between 0 and 100
            similarity_score = max(0, min(100, similarity_score))
            
            return {
                "similarity_score": similarity_score,
                "justification": justification,
                "missing_skill": missing_skill,
                "overlap_skill": overlap_skill,
                "should_apply": should_apply
            }
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}, response content: {response.content}")
            raise Exception(f"Failed to parse AI response: {str(e)}")
        except Exception as e:
            print(f"Error processing response: {e}")
            raise e

    except Exception as e:
        import traceback
        print(f"Error in match_job_with_resume: {str(e)}")
        print(traceback.format_exc())
        raise e

