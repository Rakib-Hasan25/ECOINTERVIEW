"""
Real-Time Job API Routes - No database storage, fresh data every time
"""

import os
import sys
from pathlib import Path
from flask import Blueprint, request, jsonify

# Import from parent directory
sys.path.insert(0, str(Path(__file__).parent.parent))

from realtime_job_service import realtime_job_service
from job_analytics import JobAnalytics

# Create blueprint
realtime_jobs_bp = Blueprint('realtime_jobs', __name__, url_prefix='/api/realtime-jobs')

# Initialize analytics service
analytics_service = JobAnalytics()


def filter_jobs(jobs, filters):
    """
    Filter jobs based on criteria

    Filters:
    - job_type: full-time, part-time, contract, internship
    - experience_level: entry, mid, senior
    - remote: true/false
    - min_salary: minimum salary
    - max_salary: maximum salary
    - skills: list of required skills
    - company: company name (partial match)
    - location: location (partial match)
    """
    if not filters:
        return jobs

    filtered = []

    for job in jobs:
        # Filter by job type
        if 'job_type' in filters:
            if job.get('job_type', '').lower() != filters['job_type'].lower():
                continue

        # Filter by experience level
        if 'experience_level' in filters:
            if job.get('experience_level', '').lower() != filters['experience_level'].lower():
                continue

        # Filter by remote
        if 'remote' in filters:
            remote_filter = str(filters['remote']).lower() == 'true'
            if job.get('remote', False) != remote_filter:
                continue

        # Filter by minimum salary
        if 'min_salary' in filters:
            job_min = job.get('salary_min')
            if not job_min or job_min < filters['min_salary']:
                continue

        # Filter by maximum salary
        if 'max_salary' in filters:
            job_max = job.get('salary_max')
            if not job_max or job_max > filters['max_salary']:
                continue

        # Filter by skills (job must have at least one of the required skills)
        if 'skills' in filters and filters['skills']:
            job_skills = [s.lower() for s in job.get('skills', [])]
            required_skills = [s.lower() for s in filters['skills']]
            if not any(skill in job_skills for skill in required_skills):
                continue

        # Filter by company (partial match)
        if 'company' in filters:
            if filters['company'].lower() not in job.get('company', '').lower():
                continue

        # Filter by location (partial match)
        if 'location' in filters:
            if filters['location'].lower() not in job.get('location', '').lower():
                continue

        filtered.append(job)

    return filtered


@realtime_jobs_bp.route('/search', methods=['POST'])
def search_jobs():
    """
    Search for jobs in real-time from multiple APIs with filtering

    Request body:
    {
        "query": "python developer",
        "location": "Remote",
        "sources": ["remotive", "themuse", "jsearch"],  // optional
        "use_cache": true,  // optional, default true (30 min cache)
        "filters": {  // optional filters
            "job_type": "full-time",  // full-time, part-time, contract, internship
            "experience_level": "senior",  // entry, mid, senior
            "remote": true,  // true/false
            "min_salary": 80000,  // minimum salary
            "max_salary": 150000,  // maximum salary
            "skills": ["Python", "Django"],  // must have at least one
            "company": "google",  // partial company name match
            "location_filter": "San Francisco"  // partial location match
        }
    }

    Response:
    {
        "success": true,
        "query": "python developer",
        "location": "Remote",
        "timestamp": "2024-01-15T10:30:00",
        "stats": {
            "total": 120,
            "filtered": 45,
            "by_source": {"remotive": 100, "themuse": 20}
        },
        "jobs": [...],
        "platform_links": {...}
    }
    """
    try:
        data = request.get_json() or {}

        query = data.get('query', 'software developer')
        location = data.get('location', 'United States')
        sources = data.get('sources')  # None = use defaults
        use_cache = data.get('use_cache', True)
        filters = data.get('filters', {})

        # Fetch real-time jobs
        result = realtime_job_service.fetch_jobs_realtime(
            query=query,
            location=location,
            sources=sources,
            use_cache=use_cache
        )

        # Apply filters
        original_count = len(result['jobs'])
        if filters:
            # Rename location_filter to location for the filter function
            if 'location_filter' in filters:
                filters['location'] = filters.pop('location_filter')

            result['jobs'] = filter_jobs(result['jobs'], filters)
            result['stats']['original_total'] = original_count
            result['stats']['filtered_total'] = len(result['jobs'])
            result['filters_applied'] = filters

        return jsonify({
            "success": True,
            **result
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error fetching jobs"
        }), 500


@realtime_jobs_bp.route('/match', methods=['POST'])
def match_jobs_to_user():
    """
    Search jobs and match them to user's skills

    Request body:
    {
        "query": "developer",
        "location": "Remote",
        "user_skills": ["Python", "Django", "React"],
        "min_match_percentage": 30,  // optional, default 0
        "sources": ["remotive", "themuse"]  // optional
    }

    Response:
    {
        "success": true,
        "jobs": [
            {
                "title": "Full Stack Developer",
                "company": "Tech Corp",
                "match_percentage": 85.5,
                "matched_skills": ["Python", "Django"],
                "missing_skills": ["TypeScript", "Docker"],
                "apply_url": "https://...",
                "external_platform": "LinkedIn"
            }
        ],
        "platform_links": {...}
    }
    """
    try:
        data = request.get_json()

        if not data or 'user_skills' not in data:
            return jsonify({
                "success": False,
                "message": "user_skills array is required"
            }), 400

        query = data.get('query', 'software developer')
        location = data.get('location', 'Remote')
        user_skills = data.get('user_skills', [])
        min_match = data.get('min_match_percentage', 0)
        sources = data.get('sources')

        # Fetch jobs
        result = realtime_job_service.fetch_jobs_realtime(
            query=query,
            location=location,
            sources=sources
        )

        # Match to user skills
        matched_jobs = realtime_job_service.match_jobs_to_skills(
            jobs=result['jobs'],
            user_skills=user_skills,
            min_match_percentage=min_match
        )

        return jsonify({
            "success": True,
            "query": query,
            "location": location,
            "user_skills": user_skills,
            "total_jobs_found": len(result['jobs']),
            "matched_jobs_count": len(matched_jobs),
            "jobs": matched_jobs,
            "platform_links": result['platform_links']
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error matching jobs"
        }), 500


@realtime_jobs_bp.route('/skill-gap-analysis', methods=['POST'])
def skill_gap_analysis():
    """
    Analyze skill gaps based on current job market

    Request body:
    {
        "query": "frontend developer",
        "location": "United States",
        "user_skills": ["HTML", "CSS", "JavaScript"]
    }

    Response:
    {
        "success": true,
        "user_skills": ["HTML", "CSS", "JavaScript"],
        "most_demanded_skills": [
            {"skill": "React", "job_count": 45},
            {"skill": "TypeScript", "job_count": 38}
        ],
        "top_skill_gaps": [
            {"skill": "React", "missing_in_jobs": 45},
            {"skill": "TypeScript", "missing_in_jobs": 38}
        ]
    }
    """
    try:
        data = request.get_json()

        if not data or 'user_skills' not in data:
            return jsonify({
                "success": False,
                "message": "user_skills array is required"
            }), 400

        query = data.get('query', 'software developer')
        location = data.get('location', 'United States')
        user_skills = data.get('user_skills', [])
        sources = data.get('sources')

        # Fetch jobs
        result = realtime_job_service.fetch_jobs_realtime(
            query=query,
            location=location,
            sources=sources
        )

        # Analyze skill gaps
        gap_analysis = realtime_job_service.get_skill_gap_analysis(
            jobs=result['jobs'],
            user_skills=user_skills
        )

        return jsonify({
            "success": True,
            "query": query,
            "location": location,
            "total_jobs_analyzed": len(result['jobs']),
            **gap_analysis
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error analyzing skill gaps"
        }), 500


@realtime_jobs_bp.route('/platforms', methods=['GET'])
def get_platform_links():
    """
    Get direct links to job platforms

    Query parameters:
    - query: Job search query (required)
    - location: Location (optional)

    Response:
    {
        "success": true,
        "query": "python developer",
        "location": "Remote",
        "platforms": {
            "LinkedIn": "https://...",
            "BDjobs": "https://...",
            "Indeed": "https://...",
            ...
        }
    }
    """
    try:
        query = request.args.get('query')
        if not query:
            return jsonify({
                "success": False,
                "message": "query parameter is required"
            }), 400

        location = request.args.get('location', '')

        # Generate platform links
        platform_links = realtime_job_service._generate_platform_links(query, location)

        return jsonify({
            "success": True,
            "query": query,
            "location": location,
            "platforms": platform_links,
            "platform_count": len(platform_links)
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error generating platform links"
        }), 500


@realtime_jobs_bp.route('/quick-search', methods=['GET'])
def quick_search():
    """
    Quick job search with query parameters and filters

    Query parameters:
    - q: Search query (required)
    - location: Location (optional, default: "United States")
    - limit: Number of results (optional, default: 50)
    - job_type: Filter by job type (full-time, part-time, contract, internship)
    - experience_level: Filter by level (entry, mid, senior)
    - remote: Filter remote jobs (true/false)
    - min_salary: Minimum salary
    - max_salary: Maximum salary
    - skills: Comma-separated skills (e.g., "Python,Django,React")
    - company: Company name (partial match)

    Examples:
    GET /api/realtime-jobs/quick-search?q=python+developer&location=Remote
    GET /api/realtime-jobs/quick-search?q=developer&remote=true&experience_level=senior
    GET /api/realtime-jobs/quick-search?q=frontend&skills=React,Vue&min_salary=80000
    """
    try:
        query = request.args.get('q')
        if not query:
            return jsonify({
                "success": False,
                "message": "q (query) parameter is required"
            }), 400

        location = request.args.get('location', 'United States')
        limit = int(request.args.get('limit', 50))

        # Build filters from query parameters
        filters = {}

        if request.args.get('job_type'):
            filters['job_type'] = request.args.get('job_type')

        if request.args.get('experience_level'):
            filters['experience_level'] = request.args.get('experience_level')

        if request.args.get('remote'):
            filters['remote'] = request.args.get('remote')

        if request.args.get('min_salary'):
            filters['min_salary'] = int(request.args.get('min_salary'))

        if request.args.get('max_salary'):
            filters['max_salary'] = int(request.args.get('max_salary'))

        if request.args.get('skills'):
            # Split comma-separated skills
            filters['skills'] = [s.strip() for s in request.args.get('skills').split(',')]

        if request.args.get('company'):
            filters['company'] = request.args.get('company')

        if request.args.get('location_filter'):
            filters['location'] = request.args.get('location_filter')

        # Fetch jobs (use free sources by default)
        result = realtime_job_service.fetch_jobs_realtime(
            query=query,
            location=location,
            sources=None  # Auto-detect based on API keys
        )

        # Apply filters
        original_count = len(result['jobs'])
        if filters:
            result['jobs'] = filter_jobs(result['jobs'], filters)
            result['stats']['original_total'] = original_count
            result['stats']['filtered_total'] = len(result['jobs'])
            result['filters_applied'] = filters

        # Limit results
        result['jobs'] = result['jobs'][:limit]
        result['stats']['returned'] = len(result['jobs'])

        return jsonify({
            "success": True,
            **result
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error searching jobs"
        }), 500


@realtime_jobs_bp.route('/clear-cache', methods=['POST'])
def clear_cache():
    """
    Clear the job cache to force fresh data fetch

    Response:
    {
        "success": true,
        "message": "Cache cleared successfully"
    }
    """
    try:
        realtime_job_service.clear_cache()

        return jsonify({
            "success": True,
            "message": "Cache cleared successfully"
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error clearing cache"
        }), 500


@realtime_jobs_bp.route('/analytics', methods=['POST'])
def get_analytics():
    """
    Get comprehensive analytics for job dashboard

    Request body:
    {
        "query": "developer",
        "location": "United States",
        "sources": ["remotive", "themuse"],  // optional
        "filters": {  // optional - same filters as /search
            "job_type": "full-time",
            "experience_level": "senior",
            "remote": true
        }
    }

    Response:
    {
        "success": true,
        "analytics": {
            "overview": {
                "total_jobs": 150,
                "jobs_with_salary": 85,
                "remote_jobs": 120,
                "entry_level_jobs": 30,
                "mid_level_jobs": 60,
                "senior_level_jobs": 60
            },
            "by_source": {"remotive": 100, "themuse": 50},
            "by_experience_level": {"entry": 30, "mid": 60, "senior": 60},
            "by_job_type": {"full-time": 120, "contract": 20, "part-time": 10},
            "remote_distribution": {
                "remote": 120,
                "on_site": 30,
                "remote_percentage": 80.0
            },
            "salary_statistics": {
                "minimum_salary": {"average": 75000, "median": 70000},
                "maximum_salary": {"average": 120000, "median": 115000},
                "salary_ranges": {...}
            },
            "top_companies": [
                {"company": "Google", "job_count": 15, "remote_jobs": 10}
            ],
            "top_skills": [
                {"skill": "Python", "job_count": 80, "percentage": 53.3}
            ],
            "recent_postings": {
                "last_24_hours": 20,
                "last_7_days": 85,
                "last_30_days": 140
            }
        }
    }
    """
    try:
        data = request.get_json() or {}

        query = data.get('query', 'software developer')
        location = data.get('location', 'United States')
        sources = data.get('sources')
        filters = data.get('filters', {})

        # Fetch jobs
        result = realtime_job_service.fetch_jobs_realtime(
            query=query,
            location=location,
            sources=sources
        )

        # Apply filters if provided
        jobs = result['jobs']
        if filters:
            if 'location_filter' in filters:
                filters['location'] = filters.pop('location_filter')
            jobs = filter_jobs(jobs, filters)

        # Generate analytics
        analytics = analytics_service.generate_analytics(jobs)

        return jsonify({
            "success": True,
            "query": query,
            "location": location,
            "total_jobs_fetched": len(result['jobs']),
            "jobs_analyzed": len(jobs),
            "filters_applied": filters if filters else None,
            "analytics": analytics
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error generating analytics"
        }), 500


@realtime_jobs_bp.route('/analytics/skill-trends', methods=['POST'])
def get_skill_trends():
    """
    Get skill trends and personalized skill gap analysis

    Request body:
    {
        "query": "developer",
        "location": "Remote",
        "user_skills": ["Python", "JavaScript"],  // optional
        "sources": ["remotive", "themuse"]  // optional
    }

    Response:
    {
        "success": true,
        "skill_trends": {
            "trending_skills": [
                {
                    "skill": "Python",
                    "demand": 85,
                    "percentage": 56.7,
                    "category": "Programming Language"
                }
            ],
            "total_unique_skills": 150,
            "user_skills_analysis": {  // only if user_skills provided
                "skills_you_have": [...],
                "skills_to_learn": [...],
                "skill_match_percentage": 45.5
            }
        }
    }
    """
    try:
        data = request.get_json() or {}

        query = data.get('query', 'software developer')
        location = data.get('location', 'United States')
        user_skills = data.get('user_skills')
        sources = data.get('sources')

        # Fetch jobs
        result = realtime_job_service.fetch_jobs_realtime(
            query=query,
            location=location,
            sources=sources
        )

        # Get skill trends
        skill_trends = analytics_service.get_skill_trends(
            jobs=result['jobs'],
            user_skills=user_skills
        )

        return jsonify({
            "success": True,
            "query": query,
            "location": location,
            "total_jobs_analyzed": len(result['jobs']),
            "user_skills": user_skills,
            "skill_trends": skill_trends
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error analyzing skill trends"
        }), 500


@realtime_jobs_bp.route('/analytics/location-insights', methods=['POST'])
def get_location_insights():
    """
    Get location-based insights

    Request body:
    {
        "query": "developer",
        "sources": ["remotive", "jsearch"]  // optional
    }

    Response:
    {
        "success": true,
        "location_insights": {
            "top_locations": [
                {
                    "location": "San Francisco",
                    "total_jobs": 45,
                    "remote_jobs": 30,
                    "remote_percentage": 66.7,
                    "avg_min_salary": 120000,
                    "avg_max_salary": 180000,
                    "top_companies": ["Google", "Meta", "Apple"],
                    "top_skills": ["Python", "React", "AWS"]
                }
            ],
            "total_unique_locations": 75
        }
    }
    """
    try:
        data = request.get_json() or {}

        query = data.get('query', 'software developer')
        location = data.get('location', 'United States')
        sources = data.get('sources')

        # Fetch jobs
        result = realtime_job_service.fetch_jobs_realtime(
            query=query,
            location=location,
            sources=sources
        )

        # Get location insights
        location_insights = analytics_service.get_location_insights(result['jobs'])

        return jsonify({
            "success": True,
            "query": query,
            "total_jobs_analyzed": len(result['jobs']),
            "location_insights": location_insights
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error analyzing location insights"
        }), 500


@realtime_jobs_bp.route('/health', methods=['GET'])
def health_check():
    """Check if the real-time job service is working"""
    try:
        # Check if API keys are available
        has_jsearch = bool(os.getenv('RAPIDAPI_KEY'))
        has_adzuna = bool(os.getenv('ADZUNA_APP_ID') and os.getenv('ADZUNA_APP_KEY'))

        available_sources = ["remotive", "themuse", "arbeitnow"]
        if has_jsearch:
            available_sources.append("jsearch")
        if has_adzuna:
            available_sources.append("adzuna")

        return jsonify({
            "success": True,
            "status": "healthy",
            "message": "Real-time job service is running",
            "available_sources": available_sources,
            "cache_enabled": True,
            "cache_duration_minutes": 30
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "status": "unhealthy",
            "error": str(e)
        }), 500
