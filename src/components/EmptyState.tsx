import { BookmarkPlus } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BookmarkPlus className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">No bookmarks yet</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by adding your first bookmark using the Add Bookmark button above.
      </p>
    </div>
  )
}
