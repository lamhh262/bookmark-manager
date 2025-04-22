"use client"

import { Bookmark } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tag, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { BookmarkPreview } from './BookmarkPreview'
import { ShareBookmark } from './ShareBookmark'
import { useRouter, useSearchParams } from 'next/navigation'

interface BookmarkCardProps {
  bookmark: Bookmark & { tags: string[] }
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tag', tag)
    router.push(`/?${params.toString()}`)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{bookmark.title}</span>
          <div className="flex gap-2">
            <BookmarkPreview bookmark={bookmark} />
            <ShareBookmark bookmark={bookmark} />
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
          {bookmark.tags.map((tag) => (
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
  )
}
