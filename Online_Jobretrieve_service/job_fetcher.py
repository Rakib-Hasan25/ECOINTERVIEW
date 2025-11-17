"""
Job Fetcher Service - Retrieves jobs from multiple APIs
Supports: JSearch (RapidAPI), Adzuna, Remotive, and Arbeitnow
"""

import os
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import time


class JobFetcher:
    """Fetches jobs from various job APIs"""

    def __init__(self):
        # API Keys (store in .env file)
        self.jsearch_api_key = os.getenv('RAPIDAPI_KEY')
        self.adzuna_app_id = os.getenv('ADZUNA_APP_ID')
        self.adzuna_app_key = os.getenv('ADZUNA_APP_KEY')


    def fetch_jsearch_jobs(
        self,
        query: str = "software developer",
        location: str = "Bangladesh",
        num_pages: int = 1,
        employment_types: str = "FULLTIME,PARTTIME,INTERN"
    ) -> List[Dict]:
        """
        Fetch jobs from JSearch API (RapidAPI)
        Free tier: 250 requests/month
        """
        if not self.jsearch_api_key:
            print("Warning: RAPIDAPI_KEY not set")
            return []

        url = "https://jsearch.p.rapidapi.com/search"
        headers = {
            "X-RapidAPI-Key": self.jsearch_api_key,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
        }

        all_jobs = []

        for page in range(1, num_pages + 1):
            querystring = {
                "query": query,
                "page": str(page),
                "num_pages": "1",
                "date_posted": "all",
                "employment_types": employment_types
            }

            if location:
                querystring["location"] = location

            try:
                response = requests.get(url, headers=headers, params=querystring, timeout=10)
                response.raise_for_status()
                data = response.json()

                if data.get("status") == "OK" and data.get("data"):
                    all_jobs.extend(data["data"])
                    print(f"JSearch: Fetched {len(data['data'])} jobs (page {page})")
                else:
                    print(f"JSearch: No jobs found for page {page}")

                # Rate limiting - respect API limits
                time.sleep(1)

            except requests.exceptions.RequestException as e:
                print(f"Error fetching from JSearch: {e}")
                break

        return all_jobs


    def fetch_adzuna_jobs(
        self,
        query: str = "developer",
        location: str = "bangladesh",
        results_per_page: int = 50,
        max_pages: int = 2
    ) -> List[Dict]:
        """
        Fetch jobs from Adzuna API
        Free tier: 5,000 calls/month
        Countries: us, gb, ca, au, in, etc.
        """
        if not self.adzuna_app_id or not self.adzuna_app_key:
            print("Warning: Adzuna credentials not set")
            return []

        # Determine country code from location
        location_lower = location.lower()
        if "united states" in location_lower or "usa" in location_lower or "us" in location_lower:
            country = "us"
        elif "united kingdom" in location_lower or "uk" in location_lower:
            country = "gb"
        elif "canada" in location_lower:
            country = "ca"
        elif "australia" in location_lower:
            country = "au"
        elif "india" in location_lower:
            country = "in"
        elif "bangladesh" in location_lower:
            country = "in"  # Use India as fallback since BD might not be supported
        else:
            country = "us"  # Default to US

        all_jobs = []

        for page in range(1, max_pages + 1):
            url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/{page}"

            params = {
                "app_id": self.adzuna_app_id,
                "app_key": self.adzuna_app_key,
                "what": query,
                "results_per_page": results_per_page,
                "content-type": "application/json"
            }

            # Only add 'where' parameter for specific cities, not countries
            # since country is already in the URL
            if location and not any(country_name in location.lower() for country_name in [
                "united states", "usa", "united kingdom", "uk", "canada",
                "australia", "india", "bangladesh"
            ]):
                params["where"] = location

            try:
                response = requests.get(url, params=params, timeout=10)
                response.raise_for_status()
                data = response.json()

                if data.get("results"):
                    all_jobs.extend(data["results"])
                    print(f"Adzuna: Fetched {len(data['results'])} jobs (page {page})")
                else:
                    print(f"Adzuna: No jobs found for page {page}")
                    break

                time.sleep(0.5)

            except requests.exceptions.RequestException as e:
                print(f"Error fetching from Adzuna: {e}")
                break

        return all_jobs


    def fetch_remotive_jobs(self, category: str = "software-dev") -> List[Dict]:
        """
        Fetch jobs from Remotive API (Remote jobs)
        Free, no authentication required
        Categories: software-dev, customer-support, design, marketing, etc.
        """
        url = "https://remotive.com/api/remote-jobs"

        params = {
            "category": category,
            "limit": 100
        }

        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            jobs = data.get("jobs", [])
            print(f"Remotive: Fetched {len(jobs)} jobs")
            return jobs

        except requests.exceptions.RequestException as e:
            print(f"Error fetching from Remotive: {e}")
            return []


    def fetch_arbeitnow_jobs(self, query: str = "python developer") -> List[Dict]:
        """
        Fetch jobs from Arbeitnow API
        Free, no authentication required
        Focus: Developer jobs in Europe
        """
        url = "https://www.arbeitnow.com/api/job-board-api"

        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()

            jobs = data.get("data", [])

            # Filter by query if needed
            if query:
                query_lower = query.lower()
                jobs = [
                    job for job in jobs
                    if query_lower in job.get("title", "").lower() or
                       query_lower in job.get("description", "").lower()
                ]

            print(f"Arbeitnow: Fetched {len(jobs)} jobs")
            return jobs

        except requests.exceptions.RequestException as e:
            print(f"Error fetching from Arbeitnow: {e}")
            return []


    def fetch_themuse_jobs(
        self,
        category: str = "Software Engineering",
        location: str = "",
        page: int = 0
    ) -> List[Dict]:
        """
        Fetch jobs from The Muse API
        Free tier available
        """
        url = "https://www.themuse.com/api/public/jobs"

        params = {
            "category": category,
            "page": page,
            "descending": "true"
        }

        if location:
            params["location"] = location

        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            jobs = data.get("results", [])
            print(f"The Muse: Fetched {len(jobs)} jobs")
            return jobs

        except requests.exceptions.RequestException as e:
            print(f"Error fetching from The Muse: {e}")
            return []


    def fetch_all_sources(
        self,
        query: str = "software developer",
        location: str = "Bangladesh"
    ) -> Dict[str, List[Dict]]:
        """
        Fetch jobs from all available sources
        Returns a dictionary with source name as key and jobs list as value
        """
        print(f"\n[*] Fetching jobs for: {query} in {location}\n")

        results = {
            "jsearch": [],
            "adzuna": [],
            "remotive": [],
            "arbeitnow": [],
            "themuse": []
        }

        # Fetch from JSearch
        print("[->] Fetching from JSearch...")
        results["jsearch"] = self.fetch_jsearch_jobs(query, location, num_pages=1)

        # Fetch from Adzuna
        print("[->] Fetching from Adzuna...")
        results["adzuna"] = self.fetch_adzuna_jobs(query, location, max_pages=1)

        # Fetch from Remotive
        print("[->] Fetching from Remotive...")
        results["remotive"] = self.fetch_remotive_jobs()

        # Fetch from Arbeitnow
        print("[->] Fetching from Arbeitnow...")
        results["arbeitnow"] = self.fetch_arbeitnow_jobs(query)

        # Fetch from The Muse
        print("[->] Fetching from The Muse...")
        results["themuse"] = self.fetch_themuse_jobs(category="Software Engineering")

        total_jobs = sum(len(jobs) for jobs in results.values())
        print(f"\n[OK] Total jobs fetched: {total_jobs}\n")

        return results


# Example usage
if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()  # Load environment variables from .env file

    fetcher = JobFetcher()

    # Test individual APIs
    # jobs = fetcher.fetch_remotive_jobs()
    # print(f"Found {len(jobs)} remote jobs")

    # Test all sources
    all_jobs = fetcher.fetch_all_sources(
        query="python developer",
        location="United States"
    )

    for source, jobs in all_jobs.items():
        print(f"{source}: {len(jobs)} jobs")
