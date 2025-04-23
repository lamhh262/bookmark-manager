import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import type { Bookmark } from '@/types/database'

interface BookmarkTag {
  tags: {
    name: string
  }
}

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
    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .select(`
        *,
        bookmark_tags (
          tags (
            name
          )
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      return NextResponse.json({
        error: 'Failed to fetch bookmark',
        details: error.message
      }, { status: 400 })
    }

    // Transform the response to include tags as an array of strings
    const transformedBookmark = {
      ...bookmark,
      tags: bookmark.bookmark_tags.map((bt: BookmarkTag) => bt.tags.name)
    }

    return NextResponse.json(transformedBookmark)
  } catch (error) {
    console.error('Error fetching bookmark:', error)
    return NextResponse.json({
      error: 'Failed to fetch bookmark',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PATCH(
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

    const { id } = await params
    const { title, description, url, tags }: Partial<Bookmark> = await request.json()

    // Start a transaction
    const { error: updateError } = await supabase
      .from('bookmarks')
      .update({
        title,
        description,
        url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({
        error: 'Failed to update bookmark',
        details: updateError.message
      }, { status: 400 })
    }

    // Update tags
    if (tags !== undefined) {
      // Get existing tags
      const { data: existingTags } = await supabase
        .from('tags')
        .select('id, name')
        .eq('user_id', user.id)

      // Create new tags that don't exist
      const newTags = tags.filter(tag =>
        !existingTags?.some(existingTag => existingTag.name === tag)
      )

      if (newTags.length > 0) {
        const { data: createdTags, error: createError } = await supabase
          .from('tags')
          .insert(
            newTags.map(tag => ({
              name: tag,
              user_id: user.id
            }))
          )
          .select()

        if (createError) {
          return NextResponse.json({
            error: 'Failed to create new tags',
            details: createError.message
          }, { status: 400 })
        }

        // Add new tags to existingTags
        if (createdTags) {
          existingTags?.push(...createdTags)
        }
      }

      // Delete existing bookmark_tags
      await supabase
        .from('bookmark_tags')
        .delete()
        .eq('bookmark_id', id)

      // Insert new bookmark_tags if there are any tags
      if (tags.length > 0) {
        const tagInserts = tags.map(tag => {
          const tagId = existingTags?.find(t => t.name === tag)?.id
          return {
            bookmark_id: id,
            tag_id: tagId
          }
        }).filter(tag => tag.tag_id)

        if (tagInserts.length > 0) {
          const { error: tagError } = await supabase
            .from('bookmark_tags')
            .insert(tagInserts)

          if (tagError) {
            return NextResponse.json({
              error: 'Failed to update tags',
              details: tagError.message
            }, { status: 400 })
          }
        }
      }
    }

    // Get updated bookmark with tags
    const { data: updatedBookmark, error: fetchError } = await supabase
      .from('bookmarks')
      .select(`
        *,
        bookmark_tags (
          tags (
            name
          )
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({
        error: 'Failed to fetch updated bookmark',
        details: fetchError.message
      }, { status: 400 })
    }

    // Transform the response to include tags as an array of strings
    const transformedBookmark = {
      ...updatedBookmark,
      tags: updatedBookmark.bookmark_tags.map((bt: BookmarkTag) => bt.tags.name)
    }

    return NextResponse.json(transformedBookmark)
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

    if (error) {
      return NextResponse.json({
        error: 'Failed to delete bookmark',
        details: error.message
      }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    return NextResponse.json({
      error: 'Failed to delete bookmark',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
