import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Tag } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch tag',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates: Partial<Tag> = await request.json()

    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to update tag',
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
      .from('tags')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ message: 'Tag deleted successfully' })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to delete tag',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
