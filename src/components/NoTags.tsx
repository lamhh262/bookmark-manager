import { Tag } from 'lucide-react'

export function NoTags() {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Tag className="h-4 w-4" />
      <span>No tags yet</span>
    </div>
  )
}
