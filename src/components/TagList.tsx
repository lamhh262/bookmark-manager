"use client"

import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBookmarks } from '@/context/BookmarkContext'

export function TagList({ selectedTag }: { selectedTag?: string }) {
  const { tags } = useBookmarks()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tag === selectedTag) {
      params.delete('tag')
    } else {
      params.set('tag', tag)
    }
    router.push(`/?${params.toString()}`)
  }

  if (tags.length === 0) {
    return <div className="flex flex-wrap gap-2">No tags found</div>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Button
          key={tag.id}
          variant={tag.name === selectedTag ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleTagClick(tag.name)}
        >
          {tag.name}
        </Button>
      ))}
    </div>
  )
}
