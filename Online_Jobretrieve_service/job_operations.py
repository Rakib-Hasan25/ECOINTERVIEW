"""
Job Operations API Endpoints
Flask routes for job retrieval and management
"""

import os
import sys
from pathlib import Path

from job_fetcher import JobFetcher
from job_parser import JobParser
from job_storage import JobStorage


class JobOperations:
    """Handles job-related operations"""

    def __init__(self):
        self.fetcher = JobFetcher()
        self.parser = JobParser()
        self.storage = JobStorage()


    def fetch_and_store_jobs(
        self,
        query: str = "software developer",
        location: str = "United States",
        sources: list = None
    ) -> dict:
        """
        Fetch jobs from APIs and store them in database
        """
        if sources is None:
            sources = ["jsearch", "remotive", "arbeitnow"]

        stats = {
            "total_fetched": 0,
            "total_stored": 0,
            "sources": {}
        }

        try:
            # Fetch jobs from all sources
            all_jobs = self.fetcher.fetch_all_sources(query, location)

            # Filter to requested sources
            filtered_jobs = {
                source: jobs for source, jobs in all_jobs.items()
                if source in sources
            }

            # Parse and store jobs
            for source, jobs in filtered_jobs.items():
                parsed_jobs = []

                for job in jobs:
                    try:
                        parsed_job = self.parser.parse_job(job, source)
                        parsed_jobs.append(parsed_job)
                    except Exception as e:
                        print(f"Error parsing job from {source}: {e}")
                        continue

                # Store in database
                if parsed_jobs:
                    store_stats = self.storage.store_jobs_batch(parsed_jobs)
                    stats["sources"][source] = {
                        "fetched": len(jobs),
                        "stored": store_stats["inserted"]
                    }
                    stats["total_fetched"] += len(jobs)
                    stats["total_stored"] += store_stats["inserted"]

                # Log the fetch operation
                self.storage.log_fetch(
                    source=source,
                    jobs_fetched=len(jobs),
                    status="success"
                )

            return {
                "success": True,
                "message": f"Fetched {stats['total_fetched']} jobs, stored {stats['total_stored']}",
                "stats": stats
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error fetching jobs: {str(e)}",
                "stats": stats
            }


    def get_jobs(
        self,
        limit: int = 50,
        offset: int = 0,
        filters: dict = None
    ) -> dict:
        """
        Get jobs from database with filters
        """
        try:
            jobs = self.storage.get_jobs(limit, offset, filters)

            return {
                "success": True,
                "count": len(jobs),
                "jobs": jobs
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error retrieving jobs: {str(e)}",
                "jobs": []
            }


    def search_jobs(self, search_term: str, limit: int = 50) -> dict:
        """
        Search jobs by keyword
        """
        try:
            jobs = self.storage.search_jobs(search_term, limit)

            return {
                "success": True,
                "count": len(jobs),
                "jobs": jobs
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error searching jobs: {str(e)}",
                "jobs": []
            }


    def get_job_details(self, job_id: str) -> dict:
        """
        Get detailed information about a specific job
        """
        try:
            job = self.storage.get_job_by_id(job_id)

            if not job:
                return {
                    "success": False,
                    "message": "Job not found"
                }

            return {
                "success": True,
                "job": job
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error getting job details: {str(e)}"
            }


    def match_jobs_to_user(
        self,
        user_skills: list,
        limit: int = 50
    ) -> dict:
        """
        Get jobs that match user's skills
        Returns jobs with match percentage
        """
        try:
            jobs = self.storage.get_jobs_with_skills(user_skills, limit)

            return {
                "success": True,
                "count": len(jobs),
                "jobs": jobs
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error matching jobs: {str(e)}",
                "jobs": []
            }


# Singleton instance
job_operations = JobOperations()
