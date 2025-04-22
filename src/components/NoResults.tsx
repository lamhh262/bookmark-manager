import { SearchX } from 'lucide-react'

interface NoResultsProps {
  searchTerm: string
}

export function NoResults({ searchTerm }: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <SearchX className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">No results found</h3>
      <p className="mt-1 text-sm text-gray-500">
        No bookmarks found for &quot;{searchTerm}&quot;. Try adjusting your search.
      </p>
    </div>
  )
}
