import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseReqRes } from '@/lib/supabase/supabase-req-res'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseReqRes()
    const { searchParams } = new URL(request.url)
    
    const role = searchParams.get('role')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Join users with job_seekers to get profile information
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        created_at,
        job_seekers (
          id,
          full_name,
          education_level,
          department,
          resumelink,
          experience_level,
          preferred_career_track,
          skills,
          about,
          location,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (role && role !== 'all') {
      query = query.eq('role', role)
    }

    const { data: users, error } = await query

    if (error) {
      throw error
    }

    // Transform data to match frontend interface
    const transformedUsers = users!.map(user => {
      const jobSeeker = user.job_seekers?.[0] // Get the first (and should be only) job_seeker record
      
      // Calculate profile completeness based on available fields
      const totalFields = 9
      let completedFields = 0
      if (jobSeeker?.full_name) completedFields++
      if (jobSeeker?.education_level) completedFields++
      if (jobSeeker?.department) completedFields++
      if (jobSeeker?.resumelink) completedFields++
      if (jobSeeker?.experience_level) completedFields++
      if (jobSeeker?.preferred_career_track) completedFields++
      if (jobSeeker?.skills?.length) completedFields++
      if (jobSeeker?.about) completedFields++
      if (jobSeeker?.location) completedFields++

      const profileCompleteness = Math.round((completedFields / totalFields) * 100)

      return {
        id: user.id,
        name: jobSeeker?.full_name || 'Anonymous User',
        email: user.email,
        status: 'active', // Default status since your schema doesn't have user status
        role: user.role,
        joinedAt: user.created_at.split('T')[0],
        lastActiveAt: user.created_at, // Use created_at as approximation
        skillsAssessed: jobSeeker?.skills || [],
        skillGaps: [], // Could be calculated later based on job requirements vs user skills
        jobsApplied: 0, // Default since no job applications table visible in your schema
        profileCompleteness,
        location: jobSeeker?.location || '',
        experienceLevel: jobSeeker?.experience_level || 'Fresher',
        currentJob: '', // Not in your current schema
        targetRole: jobSeeker?.preferred_career_track || '',
        learningProgress: {
          completedCourses: 0, // Not in your current schema
          hoursSpent: 0, // Not in your current schema  
          certificationsEarned: 0 // Not in your current schema
        }
      }
    })

    return NextResponse.json(transformedUsers)

  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createSupabaseReqRes()
    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      )
    }

    let updateData: any = {
      updated_at: new Date().toISOString()
    }

    switch (action) {
      case 'block':
        updateData.status = 'blocked'
        break
      case 'unblock':
        updateData.status = 'active'
        break
      case 'activate':
        updateData.status = 'active'
        break
      case 'deactivate':
        updateData.status = 'inactive'
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}