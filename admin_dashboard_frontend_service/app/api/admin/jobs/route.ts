import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseReqRes } from '@/lib/supabase/supabase-req-res'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseReqRes()
    const { searchParams } = new URL(request.url)
    
    const jobType = searchParams.get('job_type')
    const experienceLevel = searchParams.get('experience_level')
    const location = searchParams.get('location')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('jobs')
      .select(`
        id,
        job_title,
        company,
        location,
        required_skills,
        experience_level,
        job_type,
        description,
        created_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (jobType && jobType !== 'all') {
      query = query.eq('job_type', jobType)
    }

    if (experienceLevel && experienceLevel !== 'all') {
      query = query.eq('experience_level', experienceLevel)
    }

    if (location && location !== 'all') {
      query = query.ilike('location', `%${location}%`)
    }

    const { data: jobs, error } = await query

    if (error) {
      throw error
    }

    // Transform data to match frontend interface
    const transformedJobs = jobs!.map(job => ({
      id: job.id,
      title: job.job_title,
      company: job.company,
      category: job.job_type, // Map job_type to category for frontend compatibility
      requiredSkills: job.required_skills,
      experienceLevel: job.experience_level,
      location: job.location,
      salary: null, // Not in your schema
      isActive: true, // Default to active since not in schema
      createdAt: job.created_at.split('T')[0],
      applicants: 0, // Default since not in schema
      description: job.description
    }))

    return NextResponse.json(transformedJobs)

  } catch (error) {
    console.error('Jobs API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseReqRes()
    const jobData = await request.json()

    // Map experience level to database values
    const experienceLevelMap: Record<string, string> = {
      'entry': 'Entry',
      'mid': 'Mid', 
      'senior': 'Mid', // Map senior to Mid since your DB doesn't have senior
      'intern': 'Intern'
    }

    // Map category to job_type (default to Full-time if not specified)
    const jobTypeMap: Record<string, string> = {
      'Frontend': 'Full-time',
      'Backend': 'Full-time', 
      'Full Stack': 'Full-time',
      'Internship': 'Internship',
      'Part-time': 'Part-time',
      'Freelance': 'Freelance'
    }

    const mappedExperienceLevel = experienceLevelMap[jobData.experienceLevel?.toLowerCase()] || 'Entry'
    const mappedJobType = jobTypeMap[jobData.category] || 'Full-time'

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        job_title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        required_skills: jobData.requiredSkills,
        experience_level: mappedExperienceLevel,
        job_type: mappedJobType,
        description: jobData.description || ''
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      throw error
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Create job error:', error)
    return NextResponse.json(
      { error: 'Failed to create job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseReqRes()
    const { id, ...jobData } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Map experience level to database values
    const experienceLevelMap: Record<string, string> = {
      'entry': 'Entry',
      'mid': 'Mid', 
      'senior': 'Mid', // Map senior to Mid since your DB doesn't have senior
      'intern': 'Intern'
    }

    // Map category to job_type (default to Full-time if not specified)
    const jobTypeMap: Record<string, string> = {
      'Frontend': 'Full-time',
      'Backend': 'Full-time', 
      'Full Stack': 'Full-time',
      'Internship': 'Internship',
      'Part-time': 'Part-time',
      'Freelance': 'Freelance'
    }

    const mappedExperienceLevel = experienceLevelMap[jobData.experienceLevel?.toLowerCase()] || 'Entry'
    const mappedJobType = jobTypeMap[jobData.category] || 'Full-time'

    const { data, error } = await supabase
      .from('jobs')
      .update({
        job_title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        required_skills: jobData.requiredSkills,
        experience_level: mappedExperienceLevel,
        job_type: mappedJobType,
        description: jobData.description || ''
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      throw error
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Update job error:', error)
    return NextResponse.json(
      { error: 'Failed to update job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseReqRes()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete job error:', error)
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    )
  }
}