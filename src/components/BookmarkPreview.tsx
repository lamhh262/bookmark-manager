import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { Bookmark } from '@/lib/supabase'

interface BookmarkPreviewProps {
  bookmark: Bookmark
}

export function BookmarkPreview({ bookmark }: BookmarkPreviewProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{bookmark.title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 w-full h-full">
          <iframe
            src={bookmark.url}
            className="w-full h-full border-0"
            title={bookmark.title}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
