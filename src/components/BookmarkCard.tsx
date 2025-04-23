"use client"

import type { Bookmark } from '@/types/database'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tag, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { BookmarkPreview } from './BookmarkPreview'
import { ShareBookmark } from './ShareBookmark'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { EditBookmarkDialog } from './EditBookmarkDialog'
import { DeleteBookmarkDialog } from './DeleteBookmarkDialog'

interface BookmarkCardProps {
  bookmark: Bookmark & { tags: string[] }
}

export function BookmarkCard({ bookmark: initialBookmark }: BookmarkCardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [bookmark, setBookmark] = useState({
    ...initialBookmark,
    tags: initialBookmark.tags || []
  })
  const [isDeleted, setIsDeleted] = useState(false)

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tag', tag)
    router.push(`/?${params.toString()}`)
  }

  const handleEditSuccess = async () => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`)
      if (response.ok) {
        const updatedBookmark = await response.json()
        setBookmark(updatedBookmark)
      }
    } catch (error) {
      console.error('Error fetching updated bookmark:', error)
    }
  }

  const handleDeleteSuccess = () => {
    setIsDeleted(true)
  }

  if (isDeleted) return null

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="truncate">{bookmark.title}</span>
            <div className="flex gap-2">
              <BookmarkPreview bookmark={bookmark} />
              <ShareBookmark bookmark={bookmark} />
              <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Link href={bookmark.url} target="_blank">
                <Button variant="ghost" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardTitle>
          <CardDescription className="truncate">{bookmark.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(bookmark.tags || []).map((tag: string) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 hover:bg-gray-200"
              >
                <Tag className="mr-1 h-3 w-3" />
                {tag}
              </button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="text-xs text-gray-500">
          Added {new Date(bookmark.created_at).toLocaleDateString()}
        </CardFooter>
      </Card>

      <EditBookmarkDialog
        bookmark={bookmark}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleEditSuccess}
      />

      <DeleteBookmarkDialog
        bookmark={bookmark}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </>
  )
}
