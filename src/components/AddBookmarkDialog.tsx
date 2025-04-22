"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'
import { useBookmarks } from '@/context/BookmarkContext'

export function AddBookmarkDialog() {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const { toast } = useToast()
  const { refreshBookmarks, refreshTags } = useBookmarks()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          url,
          title,
          description,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
          is_public: false
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Failed to add bookmark')
      }

      toast({
        title: 'Success',
        description: 'Bookmark added successfully',
      })

      setOpen(false)
      setUrl('')
      setTitle('')
      setDescription('')
      setTags('')

      // Refresh both bookmarks and tags
      await Promise.all([refreshBookmarks(), refreshTags()])
    } catch (error) {
      console.error('Error adding bookmark:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add bookmark',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Bookmark
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Bookmark</DialogTitle>
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
          <Button type="submit" className="w-full">
            Add Bookmark
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
