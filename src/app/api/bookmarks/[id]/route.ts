import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Bookmark } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        *,
        tags:bookmark_tags(
          tag:tags(
            id,
            name
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) throw error

    // Transform the data to match the expected format
    const bookmark = {
      ...data,
      tags: data.tags.map((t: { tag: { name: string } }) => t.tag.name)
    }

    return NextResponse.json(bookmark)
  } catch (error) {
    console.error('Error fetching bookmark:', error)
    return NextResponse.json({
      error: 'Failed to fetch bookmark',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates: Partial<Bookmark> & { tags?: string[] } = await request.json()
    const { tags, ...bookmarkUpdates } = updates

    // Update bookmark data
    const { data: bookmarkResult, error: bookmarkError } = await supabase
      .from('bookmarks')
      .update(bookmarkUpdates)
      .eq('id', params.id)
      .select()
      .single()

    if (bookmarkError) throw bookmarkError

    if (tags) {
      // Delete existing bookmark_tags
      const { error: deleteError } = await supabase
        .from('bookmark_tags')
        .delete()
        .eq('bookmark_id', params.id)

      if (deleteError) throw deleteError

      // Create or get the tags
      const tagPromises = tags.map(async (tagName) => {
        const { data: existingTags, error: getTagError } = await supabase
          .from('tags')
          .select('*')
          .eq('user_id', bookmarkResult.user_id)
          .eq('name', tagName)
          .single()

        if (getTagError && getTagError.code !== 'PGRST116') {
          throw getTagError
        }

        if (existingTags) {
          return existingTags
        }

        const { data: newTag, error: createTagError } = await supabase
          .from('tags')
          .insert([{ user_id: bookmarkResult.user_id, name: tagName }])
          .select()
          .single()

        if (createTagError) throw createTagError
        return newTag
      })

      const tagResults = await Promise.all(tagPromises)

      // Create new bookmark_tags relationships
      const bookmarkTags = tagResults.map(tag => ({
        bookmark_id: params.id,
        tag_id: tag.id
      }))

      const { error: relationError } = await supabase
        .from('bookmark_tags')
        .insert(bookmarkTags)

      if (relationError) throw relationError
    }

    return NextResponse.json({
      ...bookmarkResult,
      tags: tags || []
    })
  } catch (error) {
    console.error('Error updating bookmark:', error)
    return NextResponse.json({
      error: 'Failed to update bookmark',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // The bookmark_tags will be automatically deleted due to ON DELETE CASCADE
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ message: 'Bookmark deleted successfully' })
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    return NextResponse.json({
      error: 'Failed to delete bookmark',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
