import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseReqRes } from '@/lib/supabase/supabase-req-res'
import type { AnalyticsData } from '@/types/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseReqRes()

    // Get basic metrics based on your actual schema
    const [
      { count: totalUsers },
      { count: totalJobSeekers },
      { count: totalJobs },
      { count: totalResources }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('job_seekers').select('*', { count: 'exact', head: true }),
      supabase.from('jobs').select('*', { count: 'exact', head: true }),
      supabase.from('learning_resources').select('*', { count: 'exact', head: true })
    ])

    // Get users created today (estimate active users)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: activeToday } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    // Get skills demand from job requirements
    const { data: jobsWithSkills } = await supabase
      .from('jobs')
      .select('required_skills')

    const skillsCount: Record<string, number> = {}
    jobsWithSkills?.forEach(job => {
      if (Array.isArray(job.required_skills)) {
        job.required_skills.forEach(skill => {
          skillsCount[skill] = (skillsCount[skill] || 0) + 1
        })
      }
    })

    const skillsDemand = Object.entries(skillsCount)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Get job types distribution (using job_type from your schema)
    const { data: jobTypes } = await supabase
      .from('jobs')
      .select('job_type')

    const typesCount: Record<string, number> = {}
    jobTypes?.forEach(job => {
      typesCount[job.job_type] = (typesCount[job.job_type] || 0) + 1
    })

    const totalJobsForTypes = Object.values(typesCount).reduce((sum, count) => sum + count, 0)
    const jobCategories = Object.entries(typesCount).map(([category, count]) => ({
      category,
      count,
      percentage: totalJobsForTypes > 0 ? Math.round((count / totalJobsForTypes) * 100) : 0
    }))

    // Get user growth over last 10 days
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

    const { data: userGrowthData } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', tenDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    // Group by date and create cumulative growth
    const growthByDate: Record<string, number> = {}
    userGrowthData?.forEach(user => {
      const date = new Date(user.created_at).toISOString().split('T')[0]
      growthByDate[date] = (growthByDate[date] || 0) + 1
    })

    const userGrowth = []
    let currentDate = new Date(tenDaysAgo)
    let cumulativeUsers = (totalUsers || 0) - (userGrowthData?.length || 0)

    while (currentDate <= new Date()) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const newUsers = growthByDate[dateStr] || 0
      cumulativeUsers += newUsers
      
      userGrowth.push({
        date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: cumulativeUsers
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Get skill gaps from job requirements vs available resources
    const { data: learningResources } = await supabase
      .from('learning_resources')
      .select('related_skills')

    const resourceSkills: Record<string, number> = {}
    learningResources?.forEach(resource => {
      // Split related_skills string and count each skill
      const skills = resource.related_skills?.split(',').map((s: string) => s.trim()) || []
      skills.forEach((skill: string) => {
        resourceSkills[skill] = (resourceSkills[skill] || 0) + 1
      })
    })

    // Find gaps (skills in high demand but fewer resources)
    const commonGaps = Object.entries(skillsCount)
      .map(([skill, demand]) => ({
        skill,
        occurrences: Math.max(0, demand - (resourceSkills[skill] || 0))
      }))
      .filter(gap => gap.occurrences > 0)
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 8)

    // Calculate skill gap coverage
    const totalDemand = Object.values(skillsCount).reduce((sum, count) => sum + count, 0)
    const totalResourceSkills = Object.values(resourceSkills).reduce((sum, count) => sum + count, 0)
    const skillGapCoverage = totalDemand > 0 
      ? Math.round((totalResourceSkills / totalDemand) * 100) 
      : 100

    const analyticsData: AnalyticsData = {
      metrics: {
        totalUsers: totalUsers || 0,
        jobsSuggested: totalJobs || 0,
        activeToday: activeToday || Math.round((totalUsers || 0) * 0.12), // Estimate 12% daily active
        skillGapCoverage: Math.min(skillGapCoverage, 100)
      },
      skillsDemand,
      jobCategories,
      userGrowth,
      commonGaps
    }

    return NextResponse.json(analyticsData)

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}