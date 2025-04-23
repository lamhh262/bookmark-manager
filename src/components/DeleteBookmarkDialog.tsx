"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Bookmark } from '@/types/database'
import { useRouter } from 'next/navigation'

interface DeleteBookmarkDialogProps {
  bookmark: Bookmark & { tags: string[] }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteBookmarkDialog({ bookmark, open, onOpenChange, onSuccess }: DeleteBookmarkDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete bookmark')
      }

      onOpenChange(false)
      onSuccess?.()
      router.refresh()
    } catch (error) {
      console.error('Error deleting bookmark:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Bookmark</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to delete this bookmark?</p>
          <p className="text-sm text-gray-500 mt-2">{bookmark.title}</p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
