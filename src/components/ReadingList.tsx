"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'
import { Bookmark } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'

export function ReadingList() {
  const [open, setOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

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
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      fetchBookmarks()
    }
  }, [open, toast])

  const currentBookmark = bookmarks[currentIndex]

  const handleNext = () => {
    if (currentIndex < bookmarks.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <BookOpen className="mr-2 h-4 w-4" />
            Reading List
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <BookOpen className="mr-2 h-4 w-4" />
            Reading List
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No bookmarks found</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <BookOpen className="mr-2 h-4 w-4" />
          Reading List
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Reading List</DialogTitle>
        </DialogHeader>
        <div className="flex-1 w-full h-full flex flex-col">
          <div className="flex-1 w-full h-full">
            <iframe
              src={currentBookmark?.url}
              className="w-full h-full border-0"
              title={currentBookmark?.title}
            />
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              {currentIndex + 1} of {bookmarks.length}
            </span>
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex === bookmarks.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
