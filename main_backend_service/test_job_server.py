"""
Simple Flask server to test job routes
"""

import os
import sys
from pathlib import Path
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
job_env_path = Path(__file__).parent.parent / "Online_Jobretrieve_service" / ".env"
if job_env_path.exists():
    load_dotenv(job_env_path)
    print("[OK] Loaded job service environment variables")

# Add path for job service
job_service_path = Path(__file__).parent.parent / "Online_Jobretrieve_service"
sys.path.insert(0, str(job_service_path))

# Import real-time job routes
try:
    from routes.realtime_job_routes import realtime_jobs_bp
    print("[OK] Real-time job routes loaded successfully")
except ImportError as e:
    print(f"[ERROR] Could not load job routes: {e}")
    sys.exit(1)

# Create Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register blueprint
app.register_blueprint(realtime_jobs_bp)
print("[OK] Real-time job routes registered")

# Print all routes
print("\n" + "="*70)
print("Available Routes:")
print("="*70)
for rule in app.url_map.iter_rules():
    if 'realtime-jobs' in rule.rule:
        methods = ','.join(rule.methods - {'HEAD', 'OPTIONS'})
        print(f"{methods:8} {rule.rule}")

print("\n" + "="*70)
print("Server starting on http://localhost:5001")
print("="*70)
print("\nTest endpoints:")
print("  curl http://localhost:5001/api/realtime-jobs/health")
print('  curl "http://localhost:5001/api/realtime-jobs/quick-search?q=python+developer"')
print("  curl -X POST http://localhost:5001/api/realtime-jobs/search \\")
print('       -H "Content-Type: application/json" \\')
print('       -d \'{"query": "software developer", "location": "Bangladesh"}\'')
print("\n")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
