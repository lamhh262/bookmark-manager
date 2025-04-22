import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    let query = supabase.from('profiles').select('*')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({
      error: 'Failed to fetch profiles',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const profile: Omit<UserProfile, 'id' | 'created_at'> = await request.json()

    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Profile create error:', error)
    return NextResponse.json({
      error: 'Failed to create profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
