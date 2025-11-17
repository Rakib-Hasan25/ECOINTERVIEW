import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseReqRes } from '@/lib/supabase/supabase-req-res'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseReqRes()
    const { searchParams } = new URL(request.url)
    
    const type = searchParams.get('type')
    const difficulty = searchParams.get('difficulty')
    const skillCategory = searchParams.get('skill_category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('learning_resources')
      .select(`
        id,
        title,
        platform,
        url,
        related_skills,
        cost_indicator,
        created_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by platform if provided
    if (type && type !== 'all') {
      query = query.eq('platform', type)
    }

    // Filter by cost if provided
    if (skillCategory && skillCategory !== 'all') {
      query = query.ilike('related_skills', `%${skillCategory}%`)
    }

    const { data: resources, error } = await query

    if (error) {
      throw error
    }

    // Transform data to match frontend interface
    const transformedResources = resources!.map(resource => ({
      id: resource.id.toString(),
      title: resource.title,
      type: 'course', // Default type since not in your schema
      skillCategory: resource.related_skills, // Use related_skills as skill category
      url: resource.url,
      duration: 'N/A', // Not in your schema
      difficulty: 'beginner', // Default since not in your schema  
      provider: resource.platform,
      isFree: resource.cost_indicator === 'Free'
    }))

    return NextResponse.json(transformedResources)

  } catch (error) {
    console.error('Resources API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseReqRes()
    const resourceData = await request.json()

    const { data, error } = await supabase
      .from('learning_resources')
      .insert({
        title: resourceData.title,
        platform: resourceData.provider || 'Unknown',
        url: resourceData.url,
        related_skills: resourceData.skillCategory || '',
        cost_indicator: resourceData.isFree ? 'Free' : 'Paid'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Create resource error:', error)
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseReqRes()
    const { id, ...resourceData } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('learning_resources')
      .update({
        title: resourceData.title,
        platform: resourceData.provider || 'Unknown',
        url: resourceData.url,
        related_skills: resourceData.skillCategory || '',
        cost_indicator: resourceData.isFree ? 'Free' : 'Paid'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Update resource error:', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
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
        { error: 'Resource ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('learning_resources')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete resource error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}