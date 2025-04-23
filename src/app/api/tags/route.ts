import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import type { Tag } from '@/types/database'

export async function GET() {
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

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Tag fetch error:', error)
    return NextResponse.json({
      error: 'Failed to fetch tags',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) throw userError
    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated',
        details: 'You must be logged in to create tags'
      }, { status: 401 })
    }

    const tag: Omit<Tag, 'id' | 'created_at'> = await request.json()
    const { data, error } = await supabase
      .from('tags')
      .insert([{ ...tag, user_id: user.id }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Tag create error:', error)
    return NextResponse.json({
      error: 'Failed to create tag',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
