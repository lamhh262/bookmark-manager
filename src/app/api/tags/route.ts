import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Tag } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    let query = supabase.from('tags').select('*')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch tags',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const tag: Omit<Tag, 'id' | 'created_at'> = await request.json()

    const { data, error } = await supabase
      .from('tags')
      .insert([tag])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to create tag',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
