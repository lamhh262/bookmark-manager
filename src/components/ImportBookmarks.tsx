"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'

export function ImportBookmarks() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!file) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const text = await file.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(text, 'text/html')
      const links = doc.getElementsByTagName('a')

      const bookmarks = Array.from(links).map((link) => ({
        user_id: user.id,
        url: link.href,
        title: link.textContent || link.href,
        description: '',
        tags: [],
        is_public: false,
      }))

      const { error } = await supabase
        .from('bookmarks')
        .insert(bookmarks)

      if (error) throw error

      toast({
        title: 'Success',
        description: `Imported ${bookmarks.length} bookmarks successfully`,
      })

      setOpen(false)
      setFile(null)
    } catch (error) {
      console.error('Error importing bookmarks:', error)
      toast({
        title: 'Error',
        description: 'Failed to import bookmarks',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import Bookmarks
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Bookmarks</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">HTML Bookmarks File</Label>
            <Input
              id="file"
              type="file"
              accept=".html"
              onChange={handleFileChange}
            />
          </div>
          <Button onClick={handleImport} disabled={!file}>
            Import
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
