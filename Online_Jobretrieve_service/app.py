"""
Online Job Retrieve Service - Standalone Backend
Separate from main_backend_service
"""

from flask import Flask, jsonify
from flask_cors import CORS
from config import config

# Create Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={r"/api/*": {"origins": config.CORS_ORIGINS}})

# Import routes
from routes import job_routes
from routes import realtime_job_routes

# Register blueprints
app.register_blueprint(job_routes.job_bp)
app.register_blueprint(realtime_job_routes.realtime_jobs_bp)

@app.route('/')
def index():
    """Root endpoint"""
    return jsonify({
        "service": "Online Job Retrieve Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/api/jobs/health",
            "search": "/api/jobs/search",
            "analytics": "/api/jobs/analytics",
            "skill_trends": "/api/jobs/analytics/skill-trends",
            "location_insights": "/api/jobs/analytics/location-insights"
        },
        "documentation": {
            "quick_reference": "docs/QUICK_REFERENCE.md",
            "filtering_guide": "FILTERING_GUIDE.md",
            "analytics_guide": "ANALYTICS_GUIDE.md"
        }
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Online Job Retrieve Service"
    })

if __name__ == '__main__':
    # Validate configuration
    config.validate()

    print("\n" + "="*70)
    print("[STARTUP] Online Job Retrieve Service Starting...")
    print("="*70)
    print(f"[SERVER] Running on: http://localhost:{config.PORT}")
    print(f"[HEALTH] Health check: http://localhost:{config.PORT}/health")
    print(f"[API] API base: http://localhost:{config.PORT}/api/jobs")
    print("="*70)
    print("\n[ENDPOINTS] Available Endpoints:")
    print(f"\n   Main Job Routes (/api/jobs):")
    print(f"   - GET  /api/jobs/health")
    print(f"   - POST /api/jobs/search")
    print(f"   - GET  /api/jobs/quick-search")
    print(f"   - POST /api/jobs/match")
    print(f"   - POST /api/jobs/skill-gap-analysis")
    print(f"   - GET  /api/jobs/platforms")
    print(f"   - POST /api/jobs/analytics")
    print(f"   - POST /api/jobs/analytics/skill-trends")
    print(f"   - POST /api/jobs/analytics/location-insights")
    print(f"   - POST /api/jobs/clear-cache")
    print(f"\n   Real-time Job Routes (/api/realtime-jobs):")
    print(f"   - GET  /api/realtime-jobs/health")
    print(f"   - POST /api/realtime-jobs/search")
    print(f"   - GET  /api/realtime-jobs/quick-search")
    print(f"   - POST /api/realtime-jobs/match")
    print(f"   - POST /api/realtime-jobs/skill-gap-analysis")
    print(f"   - GET  /api/realtime-jobs/platforms")
    print(f"   - POST /api/realtime-jobs/analytics")
    print(f"   - POST /api/realtime-jobs/analytics/skill-trends")
    print(f"   - POST /api/realtime-jobs/analytics/location-insights")
    print(f"   - POST /api/realtime-jobs/clear-cache")
    print("="*70 + "\n")

    app.run(
        host=config.HOST,
        port=config.PORT,
        debug=config.DEBUG
    )
