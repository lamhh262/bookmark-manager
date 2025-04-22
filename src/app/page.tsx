"use client"

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'
import { TagList } from '@/components/TagList'
import { supabase } from '@/lib/supabase'
import { AddBookmarkDialog } from '@/components/AddBookmarkDialog'
import { BookmarkCard } from '@/components/BookmarkCard'
import { EmptyState } from '@/components/EmptyState'
import { useBookmarks } from '@/context/BookmarkContext'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const { bookmarks, isLoading } = useBookmarks()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedTag = searchParams.get('tag') || ''

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) {
        router.push('/login')
      }
    }

    getUser()
  }, [router])

  const filteredBookmarks = selectedTag
    ? bookmarks.filter(bookmark => bookmark.tags?.includes(selectedTag))
    : bookmarks

  if (!user) {
    return null
  }

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
