"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil } from 'lucide-react'
import { Bookmark } from '@/types/database'
import { useToast } from '@/components/ui/use-toast'
import { useBookmarks } from '@/context/BookmarkContext'

interface EditBookmarkDialogProps {
  bookmark: Bookmark & { tags: string[] }
}

export function EditBookmarkDialog({ bookmark }: EditBookmarkDialogProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState(bookmark.url)
  const [title, setTitle] = useState(bookmark.title)
  const [description, setDescription] = useState(bookmark.description || '')
  const [tags, setTags] = useState(bookmark.tags.join(', '))
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { refreshBookmarks, refreshTags } = useBookmarks()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          title,
          description,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        })
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 401) {
          toast({
            title: 'Authentication Error',
            description: 'Please sign in to update bookmarks',
            variant: 'destructive',
          })
          return
        }
        throw new Error(error.details || 'Failed to update bookmark')
      }

      toast({
        title: 'Success',
        description: 'Bookmark updated successfully',
      })

      setOpen(false)

      // Refresh both bookmarks and tags
      await Promise.all([refreshBookmarks(), refreshTags()])
    } catch (error) {
      console.error('Error updating bookmark:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update bookmark',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Bookmark</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              placeholder="tag1, tag2, tag3"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Bookmark'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
