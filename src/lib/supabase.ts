import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface Bookmark {
  id: string
  user_id: string
  url: string
  title: string
  description: string | null
  is_public: boolean
  shared_by: string | null
  shared_with: string | null
  created_at: string
  updated_at: string
  tags: string[]
}

export interface Tag {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface BookmarkTag {
  bookmark_id: string
  tag_id: string
}

export interface UserProfile {
  id: string
  user_id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}
