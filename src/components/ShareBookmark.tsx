"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Share2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { Bookmark } from '@/types/database'

interface ShareBookmarkProps {
  bookmark: Bookmark
}

export function ShareBookmark({ bookmark }: ShareBookmarkProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_public: true,
          shared_with: email,
        })
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 401) {
          toast({
            title: 'Authentication Error',
            description: 'Please sign in to share bookmarks',
            variant: 'destructive',
          })
          return
        }
        throw new Error(error.details || 'Failed to share bookmark')
      }

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
        description: error instanceof Error ? error.message : 'Failed to share bookmark',
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sharing...' : 'Share Bookmark'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
