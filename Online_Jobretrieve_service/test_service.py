"""
Test script for real-time job service
"""

from dotenv import load_dotenv
load_dotenv()

from realtime_job_service import realtime_job_service

print("="*70)
print("TEST 1: Search Jobs for Bangladesh")
print("="*70)

# Test 1: Search jobs for Bangladesh
result1 = realtime_job_service.fetch_jobs_realtime(
    query="software developer",
    location="Bangladesh",
    sources=["remotive", "themuse"]  # Using free sources
)

print(f"\nQuery: {result1['query']}")
print(f"Location: {result1['location']}")
print(f"Total Jobs Found: {result1['stats']['total']}")
print(f"Sources Used: {list(result1['stats']['by_source'].keys())}")

print("\n--- Platform Links for Bangladesh ---")
for platform, link in list(result1['platform_links'].items())[:8]:
    print(f"{platform}: {link[:80]}...")

print("\n--- Sample Jobs ---")
for i, job in enumerate(result1['jobs'][:3], 1):
    print(f"\n{i}. {job['title']}")
    print(f"   Company: {job['company']}")
    print(f"   Location: {job['location']}")
    print(f"   Remote: {job['remote']}")
    print(f"   Skills: {', '.join(job.get('skills', [])[:5])}")
    print(f"   Apply: {job['apply_url'][:60]}...")

print("\n" + "="*70)
print("TEST 2: Match Jobs to User Skills")
print("="*70)

# Test 2: Match jobs to user skills
user_skills = ["Python", "Django", "React", "PostgreSQL"]
print(f"\nUser Skills: {user_skills}")

matched_jobs = realtime_job_service.match_jobs_to_skills(
    jobs=result1['jobs'],
    user_skills=user_skills,
    min_match_percentage=30
)

print(f"\nJobs matching > 30%: {len(matched_jobs)}")

print("\n--- Top 3 Matching Jobs ---")
for i, job in enumerate(matched_jobs[:3], 1):
    print(f"\n{i}. {job['title']} at {job['company']}")
    print(f"   Match: {job['match_percentage']}%")
    print(f"   You have: {', '.join(job['matched_skills'])}")
    print(f"   Need to learn: {', '.join(job['missing_skills'][:3])}")

print("\n" + "="*70)
print("TEST 3: Skill Gap Analysis")
print("="*70)

# Test 3: Skill gap analysis
gap_analysis = realtime_job_service.get_skill_gap_analysis(
    jobs=result1['jobs'],
    user_skills=user_skills
)

print(f"\nTotal unique skills in market: {gap_analysis['total_unique_skills']}")
print(f"User has: {gap_analysis['user_skill_count']} skills")

print("\n--- Top 5 Most Demanded Skills ---")
for skill_data in gap_analysis['most_demanded_skills'][:5]:
    print(f"  {skill_data['skill']}: Found in {skill_data['job_count']} jobs")

print("\n--- Top 5 Skills to Learn (Your Gaps) ---")
for skill_data in gap_analysis['top_skill_gaps'][:5]:
    print(f"  {skill_data['skill']}: Missing in {skill_data['missing_in_jobs']} jobs")

print("\n" + "="*70)
print("All Tests Completed Successfully!")
print("="*70)
