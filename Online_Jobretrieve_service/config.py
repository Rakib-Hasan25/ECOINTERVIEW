"""
Configuration for Online Job Retrieve Service
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

class Config:
    """Application configuration"""

    # Server settings
    HOST = '0.0.0.0'
    PORT = int(os.getenv('JOB_SERVICE_PORT', 5002))
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

    # API Keys
    RAPIDAPI_KEY = os.getenv('RAPIDAPI_KEY', '')
    ADZUNA_APP_ID = os.getenv('ADZUNA_APP_ID', '')
    ADZUNA_APP_KEY = os.getenv('ADZUNA_APP_KEY', '')

    # Cache settings
    CACHE_DURATION_MINUTES = int(os.getenv('CACHE_DURATION_MINUTES', 30))

    # CORS settings
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')

    @staticmethod
    def validate():
        """Validate configuration and show warnings"""
        print("\n[CONFIGURATION STATUS]")
        print(f"   - Port: {Config.PORT}")
        print(f"   - Debug Mode: {Config.DEBUG}")
        print(f"   - Cache Duration: {Config.CACHE_DURATION_MINUTES} minutes")

        print("\n[API KEYS STATUS]")
        print(f"   - RapidAPI (JSearch): {'[OK] Configured' if Config.RAPIDAPI_KEY else '[WARN] Not configured (free sources only)'}")
        print(f"   - Adzuna: {'[OK] Configured' if Config.ADZUNA_APP_ID and Config.ADZUNA_APP_KEY else '[WARN] Not configured (free sources only)'}")

        if not Config.RAPIDAPI_KEY and not (Config.ADZUNA_APP_ID and Config.ADZUNA_APP_KEY):
            print("\n[WARNING] No paid API keys configured. Using free sources only (Remotive, The Muse, Arbeitnow)")
            print("   To enable more job sources, add API keys to .env file")

        print()

config = Config()
