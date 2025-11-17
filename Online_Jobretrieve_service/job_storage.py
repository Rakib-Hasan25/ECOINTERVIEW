"""
Job Storage Service - Stores parsed jobs in Supabase database
"""

import os
import sys
from datetime import datetime
from typing import List, Dict, Optional
from supabase import create_client, Client


class JobStorage:
    """Handles job storage in Supabase database"""

    def __init__(self, supabase_url: str = None, supabase_key: str = None):
        """Initialize Supabase client"""
        self.supabase_url = supabase_url or os.getenv('SUPABASE_URL')
        self.supabase_key = supabase_key or os.getenv('SUPABASE_SERVICE_KEY')

        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase credentials not provided")

        self.client: Client = create_client(self.supabase_url, self.supabase_key)


    def store_job(self, job_data: Dict) -> Optional[str]:
        """
        Store a single job in the database
        Returns the job ID if successful, None otherwise
        """
        try:
            # Separate skills from job data
            skills = job_data.pop("skills", [])

            # Check if job already exists
            existing = self.client.table("retrieveJobs").select("id").eq(
                "external_job_id", job_data["external_job_id"]
            ).execute()

            if existing.data:
                # Update existing job
                job_id = existing.data[0]["id"]
                job_data["updated_at"] = datetime.now().isoformat()

                self.client.table("retrieveJobs").update(job_data).eq("id", job_id).execute()
                print(f"[Updated] {job_data['title']}")

            else:
                # Insert new job
                result = self.client.table("retrieveJobs").insert(job_data).execute()
                job_id = result.data[0]["id"]
                print(f"[Inserted] {job_data['title']}")

            # Store skills
            if skills:
                self._store_job_skills(job_id, skills)

            return job_id

        except Exception as e:
            print(f"[Error] storing job {job_data.get('title')}: {e}")
            return None


    def _store_job_skills(self, job_id: str, skills: List[str]) -> None:
        """Store skills for a job"""
        try:
            # First, add skills to skills master table if they don't exist
            for skill in skills:
                try:
                    self.client.table("skills").insert({
                        "name": skill,
                        "category": "technical"
                    }).execute()
                except:
                    # Skill already exists, skip
                    pass

            # Delete existing retrieveJob_skills for this job
            self.client.table("retrieveJob_skills").delete().eq("job_id", job_id).execute()

            # Insert new retrieveJob_skills
            skill_records = [
                {
                    "job_id": job_id,
                    "skill_name": skill,
                    "is_required": True
                }
                for skill in skills
            ]

            if skill_records:
                self.client.table("retrieveJob_skills").insert(skill_records).execute()

        except Exception as e:
            print(f"Warning: Error storing skills: {e}")


    def store_jobs_batch(self, jobs: List[Dict]) -> Dict:
        """
        Store multiple jobs in batch
        Returns statistics about the operation
        """
        stats = {
            "total": len(jobs),
            "inserted": 0,
            "updated": 0,
            "failed": 0
        }

        for job in jobs:
            job_id = self.store_job(job)
            if job_id:
                stats["inserted"] += 1
            else:
                stats["failed"] += 1

        return stats


    def log_fetch(
        self,
        source: str,
        jobs_fetched: int,
        status: str = "success",
        error_message: str = None
    ) -> None:
        """Log job fetch operation"""
        try:
            self.client.table("job_fetch_logs").insert({
                "source": source,
                "jobs_fetched": jobs_fetched,
                "status": status,
                "error_message": error_message,
                "fetch_date": datetime.now().isoformat()
            }).execute()
        except Exception as e:
            print(f"Warning: Error logging fetch: {e}")


    def get_jobs(
        self,
        limit: int = 50,
        offset: int = 0,
        filters: Dict = None
    ) -> List[Dict]:
        """
        Retrieve jobs from database with filters
        """
        try:
            query = self.client.table("retrieveJobs").select("*")

            # Apply filters
            if filters:
                if filters.get("location"):
                    query = query.ilike("location", f"%{filters['location']}%")

                if filters.get("job_type"):
                    query = query.eq("job_type", filters["job_type"])

                if filters.get("remote") is not None:
                    query = query.eq("remote", filters["remote"])

                if filters.get("experience_level"):
                    query = query.eq("experience_level", filters["experience_level"])

                if filters.get("category"):
                    query = query.eq("category", filters["category"])

                if filters.get("is_active") is not None:
                    query = query.eq("is_active", filters["is_active"])

            # Apply ordering and pagination
            query = query.order("posted_date", desc=True).range(offset, offset + limit - 1)

            result = query.execute()
            return result.data

        except Exception as e:
            print(f"Error retrieving jobs: {e}")
            return []


    def search_jobs(self, search_term: str, limit: int = 50) -> List[Dict]:
        """
        Search jobs by title, company, or description
        Uses full-text search
        """
        try:
            # Use textSearch for PostgreSQL full-text search
            result = self.client.table("retrieveJobs").select("*").text_search(
                "title",
                search_term,
                config="english"
            ).limit(limit).execute()

            # If no results, try ilike search
            if not result.data:
                result = self.client.table("retrieveJobs").select("*").or_(
                    f"title.ilike.%{search_term}%,company.ilike.%{search_term}%,description.ilike.%{search_term}%"
                ).limit(limit).execute()

            return result.data

        except Exception as e:
            print(f"Error searching jobs: {e}")
            return []


    def get_job_by_id(self, job_id: str) -> Optional[Dict]:
        """Get a single job by ID with skills"""
        try:
            # Get job details
            job_result = self.client.table("retrieveJobs").select("*").eq("id", job_id).execute()

            if not job_result.data:
                return None

            job = job_result.data[0]

            # Get job skills
            skills_result = self.client.table("retrieveJob_skills").select("skill_name").eq(
                "job_id", job_id
            ).execute()

            job["skills"] = [skill["skill_name"] for skill in skills_result.data]

            return job

        except Exception as e:
            print(f"Error getting job: {e}")
            return None


    def get_jobs_with_skills(
        self,
        user_skills: List[str],
        limit: int = 50
    ) -> List[Dict]:
        """
        Get jobs that match user skills
        Calculates match percentage
        """
        try:
            # Get all active jobs
            jobs = self.get_jobs(limit=limit, filters={"is_active": True})

            # For each job, get skills and calculate match
            jobs_with_match = []
            for job in jobs:
                job_skills_result = self.client.table("retrieveJob_skills").select(
                    "skill_name"
                ).eq("job_id", job["id"]).execute()

                job_skills = [skill["skill_name"] for skill in job_skills_result.data]
                job["skills"] = job_skills

                # Calculate match percentage
                if job_skills:
                    matched_skills = set(user_skills) & set(job_skills)
                    match_percentage = (len(matched_skills) / len(job_skills)) * 100
                    job["match_percentage"] = round(match_percentage, 2)
                    job["matched_skills"] = list(matched_skills)
                    job["missing_skills"] = list(set(job_skills) - set(user_skills))
                else:
                    job["match_percentage"] = 0
                    job["matched_skills"] = []
                    job["missing_skills"] = []

                jobs_with_match.append(job)

            # Sort by match percentage
            jobs_with_match.sort(key=lambda x: x["match_percentage"], reverse=True)

            return jobs_with_match

        except Exception as e:
            print(f"Error getting jobs with skills: {e}")
            return []


    def cleanup_old_jobs(self, days: int = 30) -> int:
        """
        Mark jobs as inactive if they're older than specified days
        Returns number of jobs marked as inactive
        """
        try:
            from datetime import timedelta
            cutoff_date = datetime.now() - timedelta(days=days)

            result = self.client.table("retrieveJobs").update({
                "is_active": False
            }).lt("posted_date", cutoff_date.isoformat()).execute()

            return len(result.data) if result.data else 0

        except Exception as e:
            print(f"Error cleaning up old jobs: {e}")
            return 0


# Example usage
if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()

    storage = JobStorage()

    # Example: Store a job
    sample_job = {
        "external_job_id": "test-123",
        "title": "Senior Python Developer",
        "company": "Tech Corp",
        "location": "Remote",
        "remote": True,
        "job_type": "full-time",
        "experience_level": "senior",
        "description": "Looking for Python developer...",
        "apply_url": "https://example.com/apply",
        "category": "IT",
        "source": "manual",
        "skills": ["Python", "Django", "PostgreSQL"]
    }

    # job_id = storage.store_job(sample_job)
    # print(f"Stored job with ID: {job_id}")

    # Example: Search jobs
    jobs = storage.search_jobs("python")
    print(f"Found {len(jobs)} jobs matching 'python'")
