"""
Job Data Parser - Normalizes job data from different APIs into a consistent format
"""

from datetime import datetime
from typing import Dict, List, Optional
import re
import uuid


class JobParser:
    """Parses and normalizes job data from various sources"""

    def __init__(self):
        self.skill_keywords = self._load_skill_keywords()


    def _load_skill_keywords(self) -> List[str]:
        """
        Load common tech skills for extraction
        In production, load this from a database
        """
        return [
            # Programming Languages
            "python", "javascript", "java", "c++", "c#", "ruby", "php", "swift",
            "kotlin", "go", "rust", "typescript", "scala", "r", "matlab",

            # Web Frameworks
            "react", "angular", "vue", "django", "flask", "fastapi", "nodejs",
            "express", "nextjs", "nuxt", "spring", "laravel", "rails",

            # Mobile
            "react native", "flutter", "android", "ios", "xamarin",

            # Databases
            "sql", "mysql", "postgresql", "mongodb", "redis", "cassandra",
            "oracle", "dynamodb", "firebase", "supabase",

            # Cloud & DevOps
            "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "ci/cd",
            "terraform", "ansible", "git", "github", "gitlab",

            # Data Science & ML
            "machine learning", "deep learning", "tensorflow", "pytorch",
            "scikit-learn", "pandas", "numpy", "data analysis", "nlp",

            # Other Skills
            "rest api", "graphql", "microservices", "agile", "scrum",
            "linux", "testing", "unit testing", "integration testing"
        ]


    def extract_skills(self, text: str) -> List[str]:
        """
        Extract skills from job description
        Uses keyword matching (can be enhanced with NLP)
        """
        if not text:
            return []

        text_lower = text.lower()
        found_skills = []

        for skill in self.skill_keywords:
            if skill in text_lower:
                found_skills.append(skill.title())

        return list(set(found_skills))  # Remove duplicates


    def parse_jsearch_job(self, job: Dict) -> Dict:
        """Parse job from JSearch API"""
        description = job.get("job_description", "")
        requirements = job.get("job_highlights", {}).get("Qualifications", [])
        benefits = job.get("job_highlights", {}).get("Benefits", [])

        # Extract skills
        skills = self.extract_skills(description)

        return {
            "external_job_id": job.get("job_id"),
            "title": job.get("job_title"),
            "company": job.get("employer_name"),
            "location": job.get("job_city") or job.get("job_country"),
            "remote": job.get("job_is_remote", False),
            "job_type": self._normalize_job_type(job.get("job_employment_type")),
            "experience_level": self._extract_experience_level(description),
            "salary_min": job.get("job_min_salary"),
            "salary_max": job.get("job_max_salary"),
            "salary_currency": job.get("job_salary_currency"),
            "description": description,
            "requirements": "\n".join(requirements) if requirements else None,
            "benefits": "\n".join(benefits) if benefits else None,
            "apply_url": job.get("job_apply_link"),
            "company_logo": job.get("employer_logo"),
            "category": "IT",  # Default category
            "posted_date": self._parse_date(job.get("job_posted_at_datetime_utc")),
            "source": "jsearch",
            "skills": skills
        }


    def parse_adzuna_job(self, job: Dict) -> Dict:
        """Parse job from Adzuna API"""
        description = job.get("description", "")
        title = job.get("title", "")

        # Extract skills
        skills = self.extract_skills(f"{title} {description}")

        return {
            "external_job_id": str(job.get("id")),
            "title": title,
            "company": job.get("company", {}).get("display_name", "Unknown"),
            "location": job.get("location", {}).get("display_name"),
            "remote": "remote" in title.lower() or "remote" in description.lower(),
            "job_type": self._normalize_job_type(job.get("contract_type")),
            "experience_level": self._extract_experience_level(description),
            "salary_min": job.get("salary_min"),
            "salary_max": job.get("salary_max"),
            "salary_currency": "USD",
            "description": description,
            "requirements": None,
            "benefits": None,
            "apply_url": job.get("redirect_url"),
            "company_logo": None,
            "category": job.get("category", {}).get("label", "IT"),
            "posted_date": self._parse_date(job.get("created")),
            "source": "adzuna",
            "skills": skills
        }


    def parse_remotive_job(self, job: Dict) -> Dict:
        """Parse job from Remotive API"""
        description = job.get("description", "")
        title = job.get("title", "")

        skills = self.extract_skills(f"{title} {description}")

        return {
            "external_job_id": str(job.get("id")),
            "title": title,
            "company": job.get("company_name"),
            "location": job.get("candidate_required_location", "Remote"),
            "remote": True,
            "job_type": self._normalize_job_type(job.get("job_type")),
            "experience_level": self._extract_experience_level(description),
            "salary_min": None,
            "salary_max": None,
            "salary_currency": None,
            "description": description,
            "requirements": None,
            "benefits": None,
            "apply_url": job.get("url"),
            "company_logo": job.get("company_logo"),
            "category": job.get("category", "IT"),
            "posted_date": self._parse_date(job.get("publication_date")),
            "source": "remotive",
            "skills": skills
        }


    def parse_arbeitnow_job(self, job: Dict) -> Dict:
        """Parse job from Arbeitnow API"""
        description = job.get("description", "")
        title = job.get("title", "")

        skills = self.extract_skills(f"{title} {description}")

        return {
            "external_job_id": job.get("slug"),
            "title": title,
            "company": job.get("company_name"),
            "location": job.get("location", "Remote"),
            "remote": job.get("remote", False),
            "job_type": "full-time",
            "experience_level": self._extract_experience_level(description),
            "salary_min": None,
            "salary_max": None,
            "salary_currency": None,
            "description": description,
            "requirements": None,
            "benefits": None,
            "apply_url": job.get("url"),
            "company_logo": None,
            "category": "IT",
            "posted_date": self._parse_date(job.get("created_at")),
            "source": "arbeitnow",
            "skills": skills
        }


    def parse_themuse_job(self, job: Dict) -> Dict:
        """Parse job from The Muse API"""
        description = job.get("contents", "")
        title = job.get("name", "")
        company = job.get("company", {})

        skills = self.extract_skills(f"{title} {description}")

        locations = job.get("locations", [])
        location = locations[0].get("name") if locations else "Unknown"

        return {
            "external_job_id": str(job.get("id")),
            "title": title,
            "company": company.get("name", "Unknown"),
            "location": location,
            "remote": any("remote" in loc.get("name", "").lower() for loc in locations),
            "job_type": self._normalize_job_type(job.get("type")),
            "experience_level": self._extract_experience_level(description),
            "salary_min": None,
            "salary_max": None,
            "salary_currency": None,
            "description": description,
            "requirements": None,
            "benefits": None,
            "apply_url": job.get("refs", {}).get("landing_page"),
            "company_logo": company.get("logo"),
            "category": job.get("categories", [{}])[0].get("name", "IT"),
            "posted_date": self._parse_date(job.get("publication_date")),
            "source": "themuse",
            "skills": skills
        }


    def parse_job(self, job: Dict, source: str) -> Dict:
        """
        Parse job based on source
        """
        parsers = {
            "jsearch": self.parse_jsearch_job,
            "adzuna": self.parse_adzuna_job,
            "remotive": self.parse_remotive_job,
            "arbeitnow": self.parse_arbeitnow_job,
            "themuse": self.parse_themuse_job
        }

        parser = parsers.get(source)
        if not parser:
            raise ValueError(f"Unknown source: {source}")

        return parser(job)


    def _normalize_job_type(self, job_type: Optional[str]) -> str:
        """Normalize job type to standard values"""
        if not job_type:
            return "full-time"

        job_type_lower = job_type.lower()

        if "full" in job_type_lower:
            return "full-time"
        elif "part" in job_type_lower:
            return "part-time"
        elif "contract" in job_type_lower or "contractor" in job_type_lower:
            return "contract"
        elif "intern" in job_type_lower:
            return "internship"
        elif "temporary" in job_type_lower or "temp" in job_type_lower:
            return "temporary"
        else:
            return "full-time"


    def _extract_experience_level(self, text: str) -> str:
        """
        Extract experience level from job description
        Returns: entry, mid, senior
        """
        if not text:
            return "mid"

        text_lower = text.lower()

        # Entry level keywords
        entry_keywords = [
            "entry level", "junior", "graduate", "fresher",
            "0-2 years", "0-1 year", "internship"
        ]

        # Senior level keywords
        senior_keywords = [
            "senior", "lead", "principal", "architect",
            "5+ years", "7+ years", "10+ years", "expert"
        ]

        if any(keyword in text_lower for keyword in entry_keywords):
            return "entry"
        elif any(keyword in text_lower for keyword in senior_keywords):
            return "senior"
        else:
            return "mid"


    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        """Parse date string to datetime object"""
        if not date_str:
            return None

        # Try different date formats
        date_formats = [
            "%Y-%m-%dT%H:%M:%S.%fZ",
            "%Y-%m-%dT%H:%M:%SZ",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d",
        ]

        for fmt in date_formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue

        return None


# Example usage
if __name__ == "__main__":
    parser = JobParser()

    # Example JSearch job
    sample_job = {
        "job_id": "123456",
        "job_title": "Senior Python Developer",
        "employer_name": "Tech Corp",
        "job_description": "We are looking for a Senior Python Developer with experience in Django, Flask, and PostgreSQL...",
        "job_is_remote": True,
        "job_employment_type": "FULLTIME"
    }

    parsed = parser.parse_jsearch_job(sample_job)
    print("Parsed job:")
    print(parsed)
    print("\nExtracted skills:", parsed["skills"])
