import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import type { Bookmark } from '@/types/database'

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
        details: 'You must be logged in to access bookmarks'
      }, { status: 401 })
    }

    const { id } = await params
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Bookmark fetch error:', error)
    return NextResponse.json({
      error: 'Failed to fetch bookmark',
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
        details: 'You must be logged in to update bookmarks'
      }, { status: 401 })
    }

    const bookmark: Partial<Bookmark> = await request.json()
    const { id } = await params

    const { data, error } = await supabase
      .from('bookmarks')
      .update(bookmark)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Bookmark update error:', error)
    return NextResponse.json({
      error: 'Failed to update bookmark',
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
        details: 'You must be logged in to delete bookmarks'
      }, { status: 401 })
    }

    const { id } = await params
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Bookmark delete error:', error)
    return NextResponse.json({
      error: 'Failed to delete bookmark',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
