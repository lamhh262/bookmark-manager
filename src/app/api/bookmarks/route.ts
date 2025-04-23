import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import type { Bookmark, Tag } from '@/types/database'

interface BookmarkTag {
  tag_id: string
  tags: Pick<Tag, 'name'>
}

interface DatabaseBookmark extends Omit<Bookmark, 'tags'> {
  bookmark_tags: BookmarkTag[] | null
}

export async function GET() {
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

    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        *,
        bookmark_tags(
          tag_id,
          tags(name)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform the data to include tags array
    const transformedData = data?.map((bookmark: DatabaseBookmark): Bookmark => ({
      ...bookmark,
      tags: bookmark.bookmark_tags?.map((bt: BookmarkTag) => bt.tags.name) || []
    }))

    return NextResponse.json(transformedData || [])
  } catch (error) {
    console.error('Bookmark fetch error:', error)
    return NextResponse.json({
      error: 'Failed to fetch bookmarks',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) throw userError
    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated',
        details: 'You must be logged in to create bookmarks'
      }, { status: 401 })
    }

    const { url, title, description, is_public, tags } = await request.json()

    // Create bookmark
    const { data: bookmark, error: bookmarkError } = await supabase
      .from('bookmarks')
      .insert([{
        user_id: user.id,
        url,
        title,
        description,
        is_public
      }])
      .select()
      .single()

    if (bookmarkError) throw bookmarkError

    // Create tags and bookmark_tags relationships
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // First, get or create the tag
        const { data: tag, error: tagError } = await supabase
          .from('tags')
          .upsert({
            user_id: user.id,
            name: tagName.trim()
          }, {
            onConflict: 'user_id,name'
          })
          .select()
          .single()

        if (tagError) throw tagError

        // Then create the bookmark_tags relationship
        const { error: relationError } = await supabase
          .from('bookmark_tags')
          .insert({
            bookmark_id: bookmark.id,
            tag_id: tag.id
          })

        if (relationError) throw relationError
      }
    }

    // Fetch the complete bookmark with tags
    const { data: completeBookmark, error: fetchError } = await supabase
      .from('bookmarks')
      .select(`
        *,
        bookmark_tags(
          tag_id,
          tags(name)
        )
      `)
      .eq('id', bookmark.id)
      .single()

    if (fetchError) throw fetchError

    // Transform the data to include tags array
    const transformedBookmark: Bookmark = {
      ...completeBookmark,
      tags: completeBookmark.bookmark_tags?.map((bt: BookmarkTag) => bt.tags.name) || []
    }

    return NextResponse.json(transformedBookmark)
  } catch (error) {
    console.error('Bookmark create error:', error)
    return NextResponse.json({
      error: 'Failed to create bookmark',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
