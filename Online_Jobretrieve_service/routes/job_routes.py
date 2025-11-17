"""
Job Retrieval Routes - Standalone Service
"""

import os
from flask import Blueprint, request, jsonify

# Import services from parent directory
from realtime_job_service import realtime_job_service
from job_analytics import JobAnalytics

# Create blueprint with /api/jobs prefix
job_bp = Blueprint('jobs', __name__, url_prefix='/api/jobs')

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


@job_bp.route('/search', methods=['POST'])
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
            "job_type": "full-time",
            "experience_level": "senior",
            "remote": true,
            "min_salary": 80000,
            "max_salary": 150000,
            "skills": ["Python", "Django"],
            "company": "google",
            "location_filter": "San Francisco"
        }
    }
    """
    try:
        data = request.get_json() or {}

        query = data.get('query', 'software developer')
        location = data.get('location', 'United States')
        sources = data.get('sources')
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


@job_bp.route('/match', methods=['POST'])
def match_jobs_to_user():
    """
    Search jobs and match them to user's skills

    Request body:
    {
        "query": "developer",
        "location": "Remote",
        "user_skills": ["Python", "Django", "React"],
        "min_match_percentage": 30,
        "sources": ["remotive", "themuse"]
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


@job_bp.route('/skill-gap-analysis', methods=['POST'])
def skill_gap_analysis():
    """
    Analyze skill gaps based on current job market

    Request body:
    {
        "query": "frontend developer",
        "location": "United States",
        "user_skills": ["HTML", "CSS", "JavaScript"]
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


@job_bp.route('/platforms', methods=['GET'])
def get_platform_links():
    """
    Get direct links to job platforms

    Query parameters:
    - query: Job search query (required)
    - location: Location (optional)
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


@job_bp.route('/quick-search', methods=['GET'])
def quick_search():
    """
    Quick job search with query parameters and filters

    Query parameters:
    - q: Search query (required)
    - location: Location (optional, default: "United States")
    - limit: Number of results (optional, default: 50)
    - job_type: Filter by job type
    - experience_level: Filter by level
    - remote: Filter remote jobs
    - min_salary: Minimum salary
    - max_salary: Maximum salary
    - skills: Comma-separated skills
    - company: Company name
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
            filters['skills'] = [s.strip() for s in request.args.get('skills').split(',')]

        if request.args.get('company'):
            filters['company'] = request.args.get('company')

        if request.args.get('location_filter'):
            filters['location'] = request.args.get('location_filter')

        # Fetch jobs
        result = realtime_job_service.fetch_jobs_realtime(
            query=query,
            location=location,
            sources=None
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


@job_bp.route('/clear-cache', methods=['POST'])
def clear_cache():
    """Clear the job cache to force fresh data fetch"""
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


@job_bp.route('/analytics', methods=['POST'])
def get_analytics():
    """
    Get comprehensive analytics for job dashboard

    Request body:
    {
        "query": "developer",
        "location": "United States",
        "sources": ["remotive", "themuse"],
        "filters": {
            "job_type": "full-time",
            "experience_level": "senior",
            "remote": true
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


@job_bp.route('/analytics/skill-trends', methods=['POST'])
def get_skill_trends():
    """
    Get skill trends and personalized skill gap analysis

    Request body:
    {
        "query": "developer",
        "location": "Remote",
        "user_skills": ["Python", "JavaScript"],
        "sources": ["remotive", "themuse"]
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


@job_bp.route('/analytics/location-insights', methods=['POST'])
def get_location_insights():
    """
    Get location-based insights

    Request body:
    {
        "query": "developer",
        "sources": ["remotive", "jsearch"]
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


@job_bp.route('/health', methods=['GET'])
def health_check():
    """Check if the job service is working"""
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
            "message": "Job retrieval service is running",
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
