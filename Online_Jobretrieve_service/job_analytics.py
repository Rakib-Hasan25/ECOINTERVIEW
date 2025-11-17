"""
Job Analytics Service
Provides analytics and statistics for job dashboard
"""

from collections import Counter, defaultdict
from datetime import datetime, timedelta
from typing import List, Dict, Any
import statistics


class JobAnalytics:
    """Analyzes job data and provides statistics for dashboard"""

    def __init__(self):
        pass

    def generate_analytics(self, jobs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate comprehensive analytics from job data

        Args:
            jobs: List of job dictionaries

        Returns:
            Dictionary containing various analytics
        """
        if not jobs:
            return self._empty_analytics()

        analytics = {
            "overview": self._get_overview(jobs),
            "by_source": self._get_by_source(jobs),
            "by_experience_level": self._get_by_experience_level(jobs),
            "by_job_type": self._get_by_job_type(jobs),
            "by_location": self._get_by_location(jobs),
            "remote_distribution": self._get_remote_distribution(jobs),
            "salary_statistics": self._get_salary_statistics(jobs),
            "top_companies": self._get_top_companies(jobs),
            "top_skills": self._get_top_skills(jobs),
            "recent_postings": self._get_recent_postings(jobs),
            "category_distribution": self._get_category_distribution(jobs),
            "timestamp": datetime.utcnow().isoformat()
        }

        return analytics

    def _empty_analytics(self) -> Dict[str, Any]:
        """Return empty analytics structure"""
        return {
            "overview": {"total_jobs": 0, "message": "No jobs available"},
            "by_source": {},
            "by_experience_level": {},
            "by_job_type": {},
            "by_location": {},
            "remote_distribution": {"remote": 0, "on_site": 0, "hybrid": 0},
            "salary_statistics": {},
            "top_companies": [],
            "top_skills": [],
            "recent_postings": {"last_24_hours": 0, "last_7_days": 0, "last_30_days": 0},
            "category_distribution": {},
            "timestamp": datetime.utcnow().isoformat()
        }

    def _get_overview(self, jobs: List[Dict]) -> Dict[str, Any]:
        """Get overview statistics"""
        total_jobs = len(jobs)

        # Count jobs with salary info
        jobs_with_salary = sum(1 for job in jobs if job.get('salary_min') or job.get('salary_max'))

        # Count remote jobs
        remote_jobs = sum(1 for job in jobs if job.get('remote'))

        # Count jobs by experience level
        entry_level = sum(1 for job in jobs if job.get('experience_level') == 'entry')
        mid_level = sum(1 for job in jobs if job.get('experience_level') == 'mid')
        senior_level = sum(1 for job in jobs if job.get('experience_level') == 'senior')

        return {
            "total_jobs": total_jobs,
            "jobs_with_salary": jobs_with_salary,
            "jobs_with_salary_percentage": round((jobs_with_salary / total_jobs) * 100, 1) if total_jobs > 0 else 0,
            "remote_jobs": remote_jobs,
            "remote_percentage": round((remote_jobs / total_jobs) * 100, 1) if total_jobs > 0 else 0,
            "entry_level_jobs": entry_level,
            "mid_level_jobs": mid_level,
            "senior_level_jobs": senior_level
        }

    def _get_by_source(self, jobs: List[Dict]) -> Dict[str, int]:
        """Get job count by source"""
        sources = [job.get('source', 'unknown') for job in jobs]
        return dict(Counter(sources))

    def _get_by_experience_level(self, jobs: List[Dict]) -> Dict[str, int]:
        """Get job count by experience level"""
        levels = [job.get('experience_level', 'not_specified') for job in jobs]
        return dict(Counter(levels))

    def _get_by_job_type(self, jobs: List[Dict]) -> Dict[str, int]:
        """Get job count by job type"""
        job_types = [job.get('job_type', 'not_specified') for job in jobs]
        return dict(Counter(job_types))

    def _get_by_location(self, jobs: List[Dict]) -> Dict[str, Any]:
        """Get job count by location (top 10)"""
        locations = [job.get('location', 'Not specified') for job in jobs if job.get('location')]
        location_counts = Counter(locations)

        # Get top 10 locations
        top_locations = dict(location_counts.most_common(10))

        return {
            "top_locations": top_locations,
            "unique_locations": len(location_counts),
            "total_with_location": sum(location_counts.values())
        }

    def _get_remote_distribution(self, jobs: List[Dict]) -> Dict[str, Any]:
        """Get remote vs on-site distribution"""
        remote_count = sum(1 for job in jobs if job.get('remote') is True)
        on_site_count = sum(1 for job in jobs if job.get('remote') is False)
        not_specified = len(jobs) - remote_count - on_site_count

        total = len(jobs)

        return {
            "remote": remote_count,
            "remote_percentage": round((remote_count / total) * 100, 1) if total > 0 else 0,
            "on_site": on_site_count,
            "on_site_percentage": round((on_site_count / total) * 100, 1) if total > 0 else 0,
            "not_specified": not_specified,
            "not_specified_percentage": round((not_specified / total) * 100, 1) if total > 0 else 0
        }

    def _get_salary_statistics(self, jobs: List[Dict]) -> Dict[str, Any]:
        """Get salary statistics"""
        salaries_min = [job.get('salary_min') for job in jobs if job.get('salary_min')]
        salaries_max = [job.get('salary_max') for job in jobs if job.get('salary_max')]

        if not salaries_min and not salaries_max:
            return {
                "jobs_with_salary": 0,
                "message": "No salary data available"
            }

        stats = {
            "jobs_with_salary": len(set([job.get('external_job_id') for job in jobs if job.get('salary_min') or job.get('salary_max')]))
        }

        if salaries_min:
            stats["minimum_salary"] = {
                "lowest": min(salaries_min),
                "highest": max(salaries_min),
                "average": round(statistics.mean(salaries_min), 2),
                "median": round(statistics.median(salaries_min), 2)
            }

        if salaries_max:
            stats["maximum_salary"] = {
                "lowest": min(salaries_max),
                "highest": max(salaries_max),
                "average": round(statistics.mean(salaries_max), 2),
                "median": round(statistics.median(salaries_max), 2)
            }

        # Salary ranges
        if salaries_min or salaries_max:
            all_salaries = salaries_min + salaries_max
            stats["salary_ranges"] = {
                "0-50k": sum(1 for s in all_salaries if s < 50000),
                "50k-80k": sum(1 for s in all_salaries if 50000 <= s < 80000),
                "80k-120k": sum(1 for s in all_salaries if 80000 <= s < 120000),
                "120k-150k": sum(1 for s in all_salaries if 120000 <= s < 150000),
                "150k+": sum(1 for s in all_salaries if s >= 150000)
            }

        return stats

    def _get_top_companies(self, jobs: List[Dict], top_n: int = 10) -> List[Dict[str, Any]]:
        """Get top companies by job count"""
        companies = [job.get('company') for job in jobs if job.get('company')]
        company_counts = Counter(companies)

        top_companies = []
        for company, count in company_counts.most_common(top_n):
            # Get sample job from this company
            company_jobs = [j for j in jobs if j.get('company') == company]

            top_companies.append({
                "company": company,
                "job_count": count,
                "sample_locations": list(set([j.get('location') for j in company_jobs[:3] if j.get('location')]))[:3],
                "remote_jobs": sum(1 for j in company_jobs if j.get('remote'))
            })

        return top_companies

    def _get_top_skills(self, jobs: List[Dict], top_n: int = 20) -> List[Dict[str, Any]]:
        """Get most in-demand skills"""
        all_skills = []
        for job in jobs:
            skills = job.get('skills', [])
            if skills:
                all_skills.extend(skills)

        if not all_skills:
            return []

        skill_counts = Counter(all_skills)

        top_skills = []
        total_jobs = len(jobs)
        for skill, count in skill_counts.most_common(top_n):
            top_skills.append({
                "skill": skill,
                "job_count": count,
                "percentage": round((count / total_jobs) * 100, 1)
            })

        return top_skills

    def _get_recent_postings(self, jobs: List[Dict]) -> Dict[str, int]:
        """Get count of recently posted jobs"""
        now = datetime.utcnow()
        last_24h = now - timedelta(days=1)
        last_7d = now - timedelta(days=7)
        last_30d = now - timedelta(days=30)

        count_24h = 0
        count_7d = 0
        count_30d = 0

        for job in jobs:
            posted_date = job.get('posted_date')
            if not posted_date:
                continue

            try:
                # Parse date string to datetime
                if isinstance(posted_date, str):
                    # Handle different date formats
                    if 'GMT' in posted_date:
                        posted_dt = datetime.strptime(posted_date.replace(' GMT', ''), '%a, %d %b %Y %H:%M:%S')
                    else:
                        posted_dt = datetime.fromisoformat(posted_date.replace('Z', '+00:00'))
                else:
                    posted_dt = posted_date

                if posted_dt >= last_24h:
                    count_24h += 1
                if posted_dt >= last_7d:
                    count_7d += 1
                if posted_dt >= last_30d:
                    count_30d += 1
            except:
                continue

        return {
            "last_24_hours": count_24h,
            "last_7_days": count_7d,
            "last_30_days": count_30d,
            "older": len(jobs) - count_30d
        }

    def _get_category_distribution(self, jobs: List[Dict]) -> Dict[str, int]:
        """Get job count by category"""
        categories = [job.get('category', 'Not specified') for job in jobs if job.get('category')]
        if not categories:
            return {}

        return dict(Counter(categories).most_common(10))

    def get_skill_trends(self, jobs: List[Dict], user_skills: List[str] = None) -> Dict[str, Any]:
        """
        Analyze skill trends and provide insights

        Args:
            jobs: List of job dictionaries
            user_skills: Optional list of user's current skills

        Returns:
            Skill trend analysis
        """
        all_skills = []
        for job in jobs:
            skills = job.get('skills', [])
            if skills:
                all_skills.extend(skills)

        if not all_skills:
            return {"message": "No skill data available"}

        skill_counts = Counter(all_skills)
        total_jobs = len(jobs)

        # Top trending skills
        trending_skills = []
        for skill, count in skill_counts.most_common(20):
            trending_skills.append({
                "skill": skill,
                "demand": count,
                "percentage": round((count / total_jobs) * 100, 1),
                "category": self._categorize_skill(skill)
            })

        result = {
            "trending_skills": trending_skills,
            "total_unique_skills": len(skill_counts),
            "total_skill_mentions": len(all_skills)
        }

        # If user skills provided, show gap analysis
        if user_skills:
            user_skills_lower = [s.lower() for s in user_skills]

            # Skills user has
            matching_skills = []
            for skill, count in skill_counts.items():
                if skill.lower() in user_skills_lower:
                    matching_skills.append({
                        "skill": skill,
                        "demand": count,
                        "percentage": round((count / total_jobs) * 100, 1)
                    })

            # Skills user should learn
            missing_skills = []
            for skill, count in skill_counts.most_common(30):
                if skill.lower() not in user_skills_lower:
                    missing_skills.append({
                        "skill": skill,
                        "demand": count,
                        "percentage": round((count / total_jobs) * 100, 1),
                        "priority": "high" if count > total_jobs * 0.3 else "medium" if count > total_jobs * 0.15 else "low"
                    })

            result["user_skills_analysis"] = {
                "skills_you_have": matching_skills[:10],
                "skills_to_learn": missing_skills[:10],
                "skill_match_percentage": round((len(matching_skills) / len(skill_counts)) * 100, 1) if skill_counts else 0
            }

        return result

    def _categorize_skill(self, skill: str) -> str:
        """Categorize a skill into broader categories"""
        skill_lower = skill.lower()

        # Programming languages
        languages = ['python', 'java', 'javascript', 'typescript', 'go', 'rust', 'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'r']
        if skill_lower in languages:
            return "Programming Language"

        # Frameworks
        frameworks = ['react', 'angular', 'vue', 'django', 'flask', 'spring', 'express', 'nodejs', 'laravel', 'rails']
        if skill_lower in frameworks:
            return "Framework"

        # Databases
        databases = ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'dynamodb', 'cassandra', 'oracle']
        if skill_lower in databases or 'sql' in skill_lower:
            return "Database"

        # Cloud
        cloud = ['aws', 'azure', 'gcp', 'cloud']
        if skill_lower in cloud:
            return "Cloud Platform"

        # DevOps
        devops = ['docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'ci/cd', 'git']
        if skill_lower in devops:
            return "DevOps"

        # Testing
        testing = ['testing', 'jest', 'pytest', 'selenium', 'cypress']
        if skill_lower in testing or 'test' in skill_lower:
            return "Testing"

        # Soft skills
        soft = ['agile', 'scrum', 'leadership', 'communication']
        if skill_lower in soft:
            return "Methodology/Soft Skill"

        return "Other"

    def get_location_insights(self, jobs: List[Dict]) -> Dict[str, Any]:
        """Get detailed location-based insights"""
        location_data = defaultdict(lambda: {
            "total_jobs": 0,
            "remote_jobs": 0,
            "avg_salary_min": [],
            "avg_salary_max": [],
            "top_companies": [],
            "top_skills": []
        })

        for job in jobs:
            location = job.get('location', 'Not specified')
            location_data[location]["total_jobs"] += 1

            if job.get('remote'):
                location_data[location]["remote_jobs"] += 1

            if job.get('salary_min'):
                location_data[location]["avg_salary_min"].append(job.get('salary_min'))

            if job.get('salary_max'):
                location_data[location]["avg_salary_max"].append(job.get('salary_max'))

            if job.get('company'):
                location_data[location]["top_companies"].append(job.get('company'))

            if job.get('skills'):
                location_data[location]["top_skills"].extend(job.get('skills'))

        # Process and format the data
        insights = []
        for location, data in sorted(location_data.items(), key=lambda x: x[1]["total_jobs"], reverse=True)[:10]:
            insight = {
                "location": location,
                "total_jobs": data["total_jobs"],
                "remote_jobs": data["remote_jobs"],
                "remote_percentage": round((data["remote_jobs"] / data["total_jobs"]) * 100, 1) if data["total_jobs"] > 0 else 0
            }

            if data["avg_salary_min"]:
                insight["avg_min_salary"] = round(statistics.mean(data["avg_salary_min"]), 2)

            if data["avg_salary_max"]:
                insight["avg_max_salary"] = round(statistics.mean(data["avg_salary_max"]), 2)

            if data["top_companies"]:
                insight["top_companies"] = [c for c, _ in Counter(data["top_companies"]).most_common(3)]

            if data["top_skills"]:
                insight["top_skills"] = [s for s, _ in Counter(data["top_skills"]).most_common(5)]

            insights.append(insight)

        return {
            "top_locations": insights,
            "total_unique_locations": len(location_data)
        }
