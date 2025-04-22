import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Bookmark } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const isPublic = searchParams.get('isPublic')

    let query = supabase.from('bookmarks').select('*')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (isPublic === 'true') {
      query = query.eq('is_public', true)
    }

    const { data, error } = await query

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch bookmarks',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const bookmark: Omit<Bookmark, 'id' | 'created_at' | 'updated_at'> = await request.json()

    const { data, error } = await supabase
      .from('bookmarks')
      .insert([bookmark])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to create bookmark',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
