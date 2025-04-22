import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates: Partial<UserProfile> = await request.json()

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to update profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ message: 'Profile deleted successfully' })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to delete profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
