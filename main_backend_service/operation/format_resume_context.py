import os
from langchain.prompts import ChatPromptTemplate
from lib.get_specific_model import get_llm_model_morefeatures

RESUME_FORMAT_PROMPT = """
You are an expert resume parser. Extract and format the following resume context into a well-structured markdown document.

Resume Context:
{resume_context}

Extract and format the following information in markdown format:

## Name
[Full name of the person]

## Social Media
[List all social media profiles and links found, if any]
- LinkedIn: [if available]
- GitHub: [if available]
- Twitter/X: [if available]
- Portfolio/Website: [if available]
- Other: [if available]

## About
[A brief summary/about section from the resume]

## Experience
[Format each experience entry with the following structure]
### [Job Title] at [Company Name]
**Duration:** [Start Date - End Date]
- [Key responsibility/achievement]
- [Key responsibility/achievement]
- [Additional points]

### [Next Job Title] at [Company Name]
**Duration:** [Start Date - End Date]
- [Key responsibility/achievement]
- [Additional points]

## Projects
[Format each project with the following structure]
### [Project Name]
**Description:** [Brief description]
**Technologies:** [Technologies used]
- [Key feature/achievement]
- [Additional points]

### [Next Project Name]
**Description:** [Brief description]
**Technologies:** [Technologies used]
- [Key feature/achievement]

## Skills
[Organize skills into categories if possible]
### Technical Skills
- [Skill 1]
- [Skill 2]
- [Skill 3]

### Soft Skills
- [Skill 1]
- [Skill 2]

### Languages
- [Language 1]
- [Language 2]

## Achievements
[List all achievements, awards, certifications, etc.]
- [Achievement 1]
- [Achievement 2]
- [Certification 1]
- [Award 1]

**Instructions:**
1. Extract only information that is clearly present in the resume context
2. If a section has no information, write "Not specified" or omit the section
3. Use proper markdown formatting
4. Keep descriptions concise and clear
5. Maintain professional formatting
6. If dates are not available, use "Not specified"
7. Organize information logically and chronologically where applicable
"""

def format_resume_context(resume_context):
    """
    Format resume context into structured markdown using OpenAI.
    
    Args:
        resume_context (str): The raw resume context/text to format
        
    Returns:
        str: Formatted resume in markdown format
    """
    try:
        # Create prompt template
        prompt_template = ChatPromptTemplate.from_template(RESUME_FORMAT_PROMPT)
        prompt = prompt_template.format(resume_context=resume_context)
        
        # Get LLM model
        llm = get_llm_model_morefeatures(
            model_name="gpt-4o",
            temperature=0.3,
            streaming=False,
            max_tokens=3000,
            frequency_penalty=0.1,
            presence_penalty=0.1
        )
        
        # Generate formatted response
        response = llm.invoke(prompt)
        
        # Return the formatted markdown
        return response.content
        
    except Exception as e:
        print(f"Error in format_resume_context: {str(e)}")
        raise e

