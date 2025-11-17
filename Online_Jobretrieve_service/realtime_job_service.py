"""
Real-Time Job Service - Fetches and returns jobs without storage
Includes links to LinkedIn, BDjobs, Glassdoor, and other job platforms
"""

import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from job_fetcher import JobFetcher
from job_parser import JobParser
import json


class RealtimeJobService:
    """Fetches jobs in real-time and provides platform links"""

    def __init__(self):
        self.fetcher = JobFetcher()
        self.parser = JobParser()

        # Simple in-memory cache (expires after 30 minutes)
        self._cache = {}
        self._cache_duration = timedelta(minutes=30)


    def _generate_platform_links(self, query: str, location: str = "") -> Dict[str, str]:
        """
        Generate direct search links to major job platforms
        """
        # Clean query for URL
        query_encoded = query.replace(" ", "+")
        location_encoded = location.replace(" ", "+") if location else ""

        links = {
            # International Platforms
            "LinkedIn": f"https://www.linkedin.com/jobs/search/?keywords={query_encoded}&location={location_encoded}",
            "Indeed": f"https://www.indeed.com/jobs?q={query_encoded}&l={location_encoded}",
            "Glassdoor": f"https://www.glassdoor.com/Job/jobs.htm?sc.keyword={query_encoded}&locT=&locId=",
            "Google Jobs": f"https://www.google.com/search?q={query_encoded}+jobs+{location_encoded}&ibp=htl;jobs",

            # Bangladesh Specific
            "BDjobs": f"https://www.bdjobs.com/jobsearch.asp?fcatId=&q={query_encoded}",
            "Bdjobstoday": f"https://bdjobstoday.com/?s={query_encoded}",
            "Chakri.com": f"https://www.chakri.com/jobs?q={query_encoded}",

            # Remote Job Platforms
            "Remote.co": f"https://remote.co/remote-jobs/search/?search_keywords={query_encoded}",
            "We Work Remotely": f"https://weworkremotely.com/remote-jobs/search?term={query_encoded}",
            "FlexJobs": f"https://www.flexjobs.com/search?search={query_encoded}",

            # Tech-Specific
            "AngelList": f"https://angel.co/jobs#find/f!%7B%22keywords%22%3A%5B%22{query_encoded}%22%5D%7D",
            "Stack Overflow": f"https://stackoverflow.com/jobs?q={query_encoded}",
            "GitHub Jobs": f"https://github.com/search?q={query_encoded}+jobs&type=repositories",
        }

        return links


    def _get_cache_key(self, query: str, location: str, sources: List[str]) -> str:
        """Generate cache key"""
        sources_str = "-".join(sorted(sources))
        return f"{query}:{location}:{sources_str}"


    def _is_cache_valid(self, cached_data: Dict) -> bool:
        """Check if cached data is still valid"""
        if not cached_data:
            return False

        cached_time = datetime.fromisoformat(cached_data.get("timestamp", ""))
        return datetime.now() - cached_time < self._cache_duration


    def fetch_jobs_realtime(
        self,
        query: str = "software developer",
        location: str = "United States",
        sources: List[str] = None,
        use_cache: bool = True
    ) -> Dict:
        """
        Fetch jobs in real-time from multiple sources

        Args:
            query: Job search query
            location: Location to search
            sources: List of sources to fetch from (default: all free sources)
            use_cache: Whether to use cached results (default: True)

        Returns:
            Dictionary with jobs and platform links
        """
        # Default to free sources that don't require API keys
        if sources is None:
            sources = ["remotive", "themuse"]

            # Add API sources if keys are available
            if os.getenv('RAPIDAPI_KEY'):
                sources.append("jsearch")
            if os.getenv('ADZUNA_APP_ID') and os.getenv('ADZUNA_APP_KEY'):
                sources.append("adzuna")

        # Check cache
        cache_key = self._get_cache_key(query, location, sources)
        if use_cache and cache_key in self._cache:
            cached_data = self._cache[cache_key]
            if self._is_cache_valid(cached_data):
                print(f"[CACHE] Returning cached results for: {query}")
                return cached_data["data"]

        print(f"[FETCH] Fetching real-time jobs for: {query} in {location}")

        # Fetch jobs from all sources
        all_jobs_raw = self.fetcher.fetch_all_sources(query, location)

        # Filter to requested sources
        filtered_jobs = {
            source: jobs for source, jobs in all_jobs_raw.items()
            if source in sources
        }

        # Parse jobs
        parsed_jobs = []
        stats = {"total": 0, "by_source": {}}

        for source, jobs in filtered_jobs.items():
            source_jobs = []

            for job in jobs:
                try:
                    parsed_job = self.parser.parse_job(job, source)

                    # Add platform information
                    parsed_job["external_platform"] = self._identify_platform(
                        parsed_job.get("apply_url", "")
                    )

                    source_jobs.append(parsed_job)
                except Exception as e:
                    print(f"[ERROR] Parsing job from {source}: {e}")
                    continue

            parsed_jobs.extend(source_jobs)
            stats["by_source"][source] = len(source_jobs)
            stats["total"] += len(source_jobs)

        # Generate platform links
        platform_links = self._generate_platform_links(query, location)

        # Prepare response
        response = {
            "query": query,
            "location": location,
            "timestamp": datetime.now().isoformat(),
            "stats": stats,
            "jobs": parsed_jobs,
            "platform_links": platform_links,
            "message": f"Found {stats['total']} real-time jobs from {len(filtered_jobs)} sources"
        }

        # Cache the results
        self._cache[cache_key] = {
            "timestamp": datetime.now().isoformat(),
            "data": response
        }

        return response


    def _identify_platform(self, url: str) -> str:
        """Identify which platform the job is from based on URL"""
        if not url:
            return "Unknown"

        url_lower = url.lower()

        if "linkedin.com" in url_lower:
            return "LinkedIn"
        elif "indeed.com" in url_lower:
            return "Indeed"
        elif "glassdoor.com" in url_lower:
            return "Glassdoor"
        elif "bdjobs.com" in url_lower:
            return "BDjobs"
        elif "stackoverflow.com" in url_lower:
            return "Stack Overflow"
        elif "angel.co" in url_lower or "wellfound.com" in url_lower:
            return "AngelList"
        elif "remote.co" in url_lower:
            return "Remote.co"
        elif "weworkremotely.com" in url_lower:
            return "We Work Remotely"
        else:
            return "Direct Company"


    def match_jobs_to_skills(
        self,
        jobs: List[Dict],
        user_skills: List[str],
        min_match_percentage: float = 0
    ) -> List[Dict]:
        """
        Match jobs to user skills and calculate match percentage

        Args:
            jobs: List of job dictionaries
            user_skills: List of user's skills
            min_match_percentage: Minimum match percentage to include (0-100)

        Returns:
            List of jobs with match information, sorted by match percentage
        """
        matched_jobs = []

        for job in jobs:
            job_skills = job.get("skills", [])

            if not job_skills:
                # No skills listed, include with 0% match
                job["match_percentage"] = 0
                job["matched_skills"] = []
                job["missing_skills"] = []
            else:
                # Calculate match
                matched_skills = set(user_skills) & set(job_skills)
                match_percentage = (len(matched_skills) / len(job_skills)) * 100

                job["match_percentage"] = round(match_percentage, 2)
                job["matched_skills"] = list(matched_skills)
                job["missing_skills"] = list(set(job_skills) - set(user_skills))

            # Include if meets minimum match percentage
            if job["match_percentage"] >= min_match_percentage:
                matched_jobs.append(job)

        # Sort by match percentage (highest first)
        matched_jobs.sort(key=lambda x: x["match_percentage"], reverse=True)

        return matched_jobs


    def get_skill_gap_analysis(
        self,
        jobs: List[Dict],
        user_skills: List[str]
    ) -> Dict:
        """
        Analyze skill gaps across all jobs

        Returns:
            Dictionary with most in-demand skills and gap analysis
        """
        all_job_skills = []
        missing_skills_count = {}

        for job in jobs:
            job_skills = job.get("skills", [])
            all_job_skills.extend(job_skills)

            # Count missing skills
            for skill in job_skills:
                if skill not in user_skills:
                    missing_skills_count[skill] = missing_skills_count.get(skill, 0) + 1

        # Most in-demand skills
        skill_frequency = {}
        for skill in all_job_skills:
            skill_frequency[skill] = skill_frequency.get(skill, 0) + 1

        # Sort by frequency
        most_demanded = sorted(
            skill_frequency.items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]

        # Top missing skills
        top_gaps = sorted(
            missing_skills_count.items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]

        return {
            "user_skills": user_skills,
            "most_demanded_skills": [
                {"skill": skill, "job_count": count}
                for skill, count in most_demanded
            ],
            "top_skill_gaps": [
                {"skill": skill, "missing_in_jobs": count}
                for skill, count in top_gaps
            ],
            "total_unique_skills": len(skill_frequency),
            "user_skill_count": len(user_skills)
        }


    def clear_cache(self):
        """Clear the cache"""
        self._cache = {}
        print("[CACHE] Cache cleared")


# Singleton instance
realtime_job_service = RealtimeJobService()


# Example usage
if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()

    service = RealtimeJobService()

    # Fetch real-time jobs
    result = service.fetch_jobs_realtime(
        query="python developer",
        location="Remote",
        sources=["remotive", "themuse"]  # Free sources
    )

    print(f"\n{'='*60}")
    print(f"Query: {result['query']}")
    print(f"Location: {result['location']}")
    print(f"Total Jobs: {result['stats']['total']}")
    print(f"{'='*60}\n")

    # Show first 3 jobs
    for i, job in enumerate(result['jobs'][:3], 1):
        print(f"{i}. {job['title']} at {job['company']}")
        print(f"   Location: {job['location']}")
        print(f"   Platform: {job.get('external_platform', 'Unknown')}")
        print(f"   Skills: {', '.join(job.get('skills', [])[:5])}")
        print(f"   Apply: {job['apply_url']}")
        print()

    # Show platform links
    print(f"\n{'='*60}")
    print("Direct Search Links:")
    print(f"{'='*60}")
    for platform, link in list(result['platform_links'].items())[:5]:
        print(f"{platform}: {link}")
