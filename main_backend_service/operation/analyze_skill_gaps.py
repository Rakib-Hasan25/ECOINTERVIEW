import os
import json
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from constant.all_prompt import SKILL_GAP_ANALYSIS_PROMPT

def analyze_skill_gaps(resume_context, career_track, experience_level):
    """
    Analyze skill gaps between a candidate's resume and their desired career track.
    
    Args:
        resume_context (str): The user's resume context
        career_track (str): The desired job role/career track
        experience_level (str): The candidate's experience level (e.g., "entry", "mid", "senior")
        
    Returns:
        dict: A detailed analysis containing:
            - missing_skills (list): Array of missing skills categorized by importance
            - existing_skills (list): Array of skills the candidate already has
            - skill_gaps_by_category (dict): Skills grouped by category (technical, soft, domain-specific, etc.)
            - priority_skills (list): High-priority skills to learn first
            - learning_recommendations (list): Recommended learning paths/resources
            - overall_readiness (str): Overall readiness assessment
            - readiness_score (float): Percentage readiness (0-100)
            - detailed_analysis (str): Comprehensive text analysis
    """
    try:
        # Validate inputs
        if not resume_context or not resume_context.strip():
            raise ValueError("resume_context is required")
        if not career_track or not career_track.strip():
            raise ValueError("career_track is required")
        if not experience_level or not experience_level.strip():
            raise ValueError("experience_level is required")
        
        # Create prompt template
        prompt_template = ChatPromptTemplate.from_template(SKILL_GAP_ANALYSIS_PROMPT)
        prompt = prompt_template.format(
            resume_context=resume_context,
            career_track=career_track,
            experience_level=experience_level
        )

        # Use ChatOpenAI with JSON mode
        llm = ChatOpenAI(
            model_name="gpt-4o",
            temperature=0.2,
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
            missing_skills = result.get("missing_skills", [])
            existing_skills = result.get("existing_skills", [])
            skill_gaps_by_category = result.get("skill_gaps_by_category", {})
            priority_skills = result.get("priority_skills", [])
            learning_recommendations = result.get("learning_recommendations", [])
            overall_readiness = result.get("overall_readiness", "Unknown")
            readiness_score = float(result.get("readiness_score", 0))
            detailed_analysis = result.get("detailed_analysis", "")
            
            # Ensure arrays are lists
            if not isinstance(missing_skills, list):
                missing_skills = [missing_skills] if missing_skills else []
            if not isinstance(existing_skills, list):
                existing_skills = [existing_skills] if existing_skills else []
            if not isinstance(priority_skills, list):
                priority_skills = [priority_skills] if priority_skills else []
            if not isinstance(learning_recommendations, list):
                learning_recommendations = [learning_recommendations] if learning_recommendations else []
            
            # Ensure skill_gaps_by_category is a dict
            if not isinstance(skill_gaps_by_category, dict):
                skill_gaps_by_category = {}
            
            # Ensure readiness_score is between 0 and 100
            readiness_score = max(0, min(100, readiness_score))
            
            return {
                "missing_skills": missing_skills,
                "existing_skills": existing_skills,
                "skill_gaps_by_category": skill_gaps_by_category,
                "priority_skills": priority_skills,
                "learning_recommendations": learning_recommendations,
                "overall_readiness": overall_readiness,
                "readiness_score": readiness_score,
                "detailed_analysis": detailed_analysis
            }
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}, response content: {response.content}")
            raise Exception(f"Failed to parse AI response: {str(e)}")
        except Exception as e:
            print(f"Error processing response: {e}")
            raise e

    except Exception as e:
        import traceback
        print(f"Error in analyze_skill_gaps: {str(e)}")
        print(traceback.format_exc())
        raise e


