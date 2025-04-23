"use client"

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { useSearchParams } from 'next/navigation'
import { TagList } from '@/components/TagList'
import { createClient } from '@/utils/supabase/client'
import { AddBookmarkDialog } from '@/components/AddBookmarkDialog'
import { BookmarkCard } from '@/components/BookmarkCard'
import { EmptyState } from '@/components/EmptyState'
import { useBookmarks } from '@/context/BookmarkContext'
import { AuthButton } from '@/components/AuthButton'

function AuthenticatedContent() {
  const { bookmarks, isLoading } = useBookmarks()
  const searchParams = useSearchParams()
  const selectedTag = searchParams.get('tag') || ''

  const filteredBookmarks = selectedTag
    ? bookmarks.filter(bookmark => bookmark.tags?.includes(selectedTag))
    : bookmarks

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Bookmarks</h1>
          <div className="flex items-center space-x-4">
            <AddBookmarkDialog />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <TagList selectedTag={selectedTag} />
          </div>
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : filteredBookmarks.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4">
                {filteredBookmarks.map((bookmark) => (
                  <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Bookmark Manager</h1>
          <p className="text-gray-600 mb-8">Please sign in to manage your bookmarks</p>
          <AuthButton />
        </div>
      </div>
    )
  }

  return <AuthenticatedContent />
}
