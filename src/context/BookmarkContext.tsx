"use client"

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Bookmark, Tag } from '@/types/database'
import { createClient } from '@/utils/supabase/client'
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

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setBookmarks([])
        setTags([])
        setIsInitialized(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchBookmarks = useCallback(async () => {
    try {
      const { data: { user } } = await createClient().auth.getUser()
      if (!user) {
        setBookmarks([])
        return
      }

      const response = await fetch('/api/bookmarks')
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
  }, [toast])

  const fetchTags = useCallback(async () => {
    try {
      const { data: { user } } = await createClient().auth.getUser()
      if (!user) {
        setTags([])
        return
      }

      const response = await fetch('/api/tags')
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
  }, [toast])

  const fetchData = useCallback(async () => {
    if (isInitialized) return
    setIsLoading(true)
    try {
      await Promise.all([fetchBookmarks(), fetchTags()])
      setIsInitialized(true)
    } finally {
      setIsLoading(false)
    }
  }, [fetchBookmarks, fetchTags, isInitialized])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
