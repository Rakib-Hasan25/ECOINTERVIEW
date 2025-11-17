"""
Job Scheduler - Periodically fetches jobs from APIs
Uses APScheduler for scheduling
"""

import os
import sys
from pathlib import Path
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add the current directory to path
current_path = Path(__file__).parent
sys.path.insert(0, str(current_path))

from job_fetcher import JobFetcher
from job_parser import JobParser
from job_storage import JobStorage


class JobScheduler:
    """Schedules periodic job fetching"""

    def __init__(self):
        self.fetcher = JobFetcher()
        self.parser = JobParser()
        self.storage = JobStorage()
        self.scheduler = BackgroundScheduler()

        # Configuration
        self.fetch_interval_hours = int(os.getenv('JOB_FETCH_INTERVAL_HOURS', 6))
        self.cleanup_days = int(os.getenv('JOB_CLEANUP_DAYS', 30))


    def fetch_job_task(self):
        """
        Task to fetch jobs from all sources
        This runs periodically
        """
        logger.info("[SCHEDULER] Starting scheduled job fetch...")

        try:
            # Define job queries to fetch
            queries = [
                {"query": "software developer", "location": "United States"},
                {"query": "python developer", "location": "Remote"},
                {"query": "frontend developer", "location": "United States"},
                {"query": "data scientist", "location": "United States"},
                {"query": "backend developer", "location": "Remote"},
            ]

            total_fetched = 0
            total_stored = 0

            for query_config in queries:
                logger.info(f"Fetching: {query_config['query']} in {query_config['location']}")

                # Fetch from all sources
                all_jobs = self.fetcher.fetch_all_sources(
                    query_config["query"],
                    query_config["location"]
                )

                # Parse and store jobs from each source
                for source, jobs in all_jobs.items():
                    if not jobs:
                        continue

                    parsed_jobs = []

                    for job in jobs:
                        try:
                            parsed_job = self.parser.parse_job(job, source)
                            parsed_jobs.append(parsed_job)
                        except Exception as e:
                            logger.error(f"Error parsing job from {source}: {e}")
                            continue

                    # Store in database
                    if parsed_jobs:
                        stats = self.storage.store_jobs_batch(parsed_jobs)
                        total_fetched += len(jobs)
                        total_stored += stats["inserted"]

                        logger.info(
                            f"  {source}: Fetched {len(jobs)}, Stored {stats['inserted']}"
                        )

                        # Log the fetch operation
                        self.storage.log_fetch(
                            source=f"{source}_{query_config['query']}",
                            jobs_fetched=len(jobs),
                            status="success"
                        )

            logger.info(
                f"[OK] Job fetch completed. "
                f"Fetched: {total_fetched}, Stored: {total_stored}"
            )

        except Exception as e:
            logger.error(f"[ERROR] Error in scheduled job fetch: {e}")


    def cleanup_task(self):
        """
        Task to cleanup old jobs
        Marks jobs older than X days as inactive
        """
        logger.info("[CLEANUP] Running job cleanup task...")

        try:
            count = self.storage.cleanup_old_jobs(self.cleanup_days)
            logger.info(f"[OK] Cleanup completed. Marked {count} jobs as inactive")

        except Exception as e:
            logger.error(f"[ERROR] Error in cleanup task: {e}")


    def start(self):
        """Start the scheduler"""
        logger.info("[START] Starting job scheduler...")

        # Schedule job fetching
        self.scheduler.add_job(
            func=self.fetch_job_task,
            trigger=IntervalTrigger(hours=self.fetch_interval_hours),
            id='fetch_jobs',
            name='Fetch jobs from APIs',
            replace_existing=True
        )
        logger.info(f"  [SCHEDULE] Job fetching scheduled every {self.fetch_interval_hours} hours")

        # Schedule cleanup (runs daily at 2 AM)
        self.scheduler.add_job(
            func=self.cleanup_task,
            trigger='cron',
            hour=2,
            minute=0,
            id='cleanup_jobs',
            name='Cleanup old jobs',
            replace_existing=True
        )
        logger.info("  [SCHEDULE] Job cleanup scheduled daily at 2:00 AM")

        # Start the scheduler
        self.scheduler.start()
        logger.info("[OK] Scheduler started successfully")

        # Run initial fetch
        logger.info("[RUN] Running initial job fetch...")
        self.fetch_job_task()


    def stop(self):
        """Stop the scheduler"""
        logger.info("[STOP] Stopping scheduler...")
        self.scheduler.shutdown()
        logger.info("[OK] Scheduler stopped")


    def run_once(self):
        """Run the job fetch task once (for testing)"""
        logger.info("[RUN] Running one-time job fetch...")
        self.fetch_job_task()
        logger.info("[OK] One-time fetch completed")


# Example usage
if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()

    scheduler = JobScheduler()

    # Option 1: Run once (for testing)
    # scheduler.run_once()

    # Option 2: Start scheduler (runs continuously)
    try:
        scheduler.start()

        # Keep the script running
        import time
        while True:
            time.sleep(60)

    except (KeyboardInterrupt, SystemExit):
        scheduler.stop()
