"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { Bookmark, Tag } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'

interface BookmarkContextType {
  bookmarks: Bookmark[]
  tags: Tag[]
  isLoading: boolean
  refreshBookmarks: () => Promise<void>
  refreshTags: () => Promise<void>
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined)

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const { toast } = useToast()

  const fetchBookmarks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const response = await fetch(`/api/bookmarks?userId=${user.id}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Failed to fetch bookmarks')
      }

      const data = await response.json()
      setBookmarks(data)
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch bookmarks',
        variant: 'destructive',
      })
    }
  }

  const fetchTags = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const response = await fetch(`/api/tags?userId=${user.id}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Failed to fetch tags')
      }

      const data = await response.json()
      setTags(data)
    } catch (error) {
      console.error('Error fetching tags:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch tags',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      if (isInitialized || !mounted) return

      setIsLoading(true)
      await Promise.all([fetchBookmarks(), fetchTags()])
      if (mounted) {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    initialize()

    return () => {
      mounted = false
    }
  }, [isInitialized])

  return (
    <BookmarkContext.Provider value={{
      bookmarks,
      tags,
      isLoading,
      refreshBookmarks: fetchBookmarks,
      refreshTags: fetchTags,
    }}>
      {children}
    </BookmarkContext.Provider>
  )
}

export function useBookmarks() {
  const context = useContext(BookmarkContext)
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider')
  }
  return context
}
