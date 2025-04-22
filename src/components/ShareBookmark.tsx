"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Share2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'
import { Bookmark } from '@/lib/supabase'

interface ShareBookmarkProps {
  bookmark: Bookmark
}

export function ShareBookmark({ bookmark }: ShareBookmarkProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const { toast } = useToast()

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          url: bookmark.url,
          title: bookmark.title,
          description: bookmark.description,
          tags: bookmark.tags,
          is_public: true,
          shared_by: bookmark.user_id,
          shared_with: email,
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Bookmark shared successfully',
      })

      setOpen(false)
      setEmail('')
    } catch (error) {
      console.error('Error sharing bookmark:', error)
      toast({
        title: 'Error',
        description: 'Failed to share bookmark',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Bookmark</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleShare} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Share
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
