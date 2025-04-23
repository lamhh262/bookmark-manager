import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import type { Tag } from '@/types/database'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) throw userError
    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated',
        details: 'You must be logged in to access tags'
      }, { status: 401 })
    }

    const { id } = await params
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Tag fetch error:', error)
    return NextResponse.json({
      error: 'Failed to fetch tag',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) throw userError
    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated',
        details: 'You must be logged in to update tags'
      }, { status: 401 })
    }

    const tag: Partial<Tag> = await request.json()
    const { id } = await params

    const { data, error } = await supabase
      .from('tags')
      .update(tag)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Tag update error:', error)
    return NextResponse.json({
      error: 'Failed to update tag',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) throw userError
    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated',
        details: 'You must be logged in to delete tags'
      }, { status: 401 })
    }

    const { id } = await params
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Tag delete error:', error)
    return NextResponse.json({
      error: 'Failed to delete tag',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
