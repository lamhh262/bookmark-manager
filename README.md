# Bookmark Manager

A simple bookmark manager built with Next.js, Supabase, and shadcn/ui.

## Features

- Store and organize bookmarks
- Share bookmarks with others
- Import bookmarks from browser
- Tags and search functionality
- Reading list mode
- Preview bookmarked websites

## Tech Stack

- Next.js 14
- TypeScript
- Supabase (Authentication & Database)
- shadcn/ui
- Tailwind CSS
- Vercel (Deployment)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```

3. Create a Supabase project and get your project URL and anon key

4. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Create the following tables in your Supabase database:

   ```sql
   -- bookmarks table
   create table bookmarks (
     id uuid default uuid_generate_v4() primary key,
     user_id uuid references auth.users not null,
     url text not null,
     title text not null,
     description text,
     is_public boolean default false,
     shared_by uuid references auth.users,
     shared_with text,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Enable RLS
   alter table bookmarks enable row level security;

   -- Create policies
   create policy "Users can view their own bookmarks"
     on bookmarks for select
     using (auth.uid() = user_id);

   create policy "Users can view shared bookmarks"
     on bookmarks for select
     using (is_public = true or shared_with = auth.email());

   create policy "Users can insert their own bookmarks"
     on bookmarks for insert
     with check (auth.uid() = user_id);

   create policy "Users can update their own bookmarks"
     on bookmarks for update
     using (auth.uid() = user_id);

   create policy "Users can delete their own bookmarks"
     on bookmarks for delete
     using (auth.uid() = user_id);

   -- tags table
   create table tags (
     id uuid default uuid_generate_v4() primary key,
     user_id uuid references auth.users not null,
     name text not null,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     unique(user_id, name)
   );

   -- Enable RLS
   alter table tags enable row level security;

   -- Create policies
   create policy "Users can view their own tags"
     on tags for select
     using (auth.uid() = user_id);

   create policy "Users can insert their own tags"
     on tags for insert
     with check (auth.uid() = user_id);

   create policy "Users can update their own tags"
     on tags for update
     using (auth.uid() = user_id);

   create policy "Users can delete their own tags"
     on tags for delete
     using (auth.uid() = user_id);

   -- bookmark_tags table for many-to-many relationship
   create table bookmark_tags (
     bookmark_id uuid references bookmarks on delete cascade not null,
     tag_id uuid references tags on delete cascade not null,
     primary key (bookmark_id, tag_id)
   );

   -- Enable RLS
   alter table bookmark_tags enable row level security;

   -- Create policies
   create policy "Users can view their own bookmark tags"
     on bookmark_tags for select
     using (
       exists (
         select 1 from bookmarks
         where id = bookmark_id
         and user_id = auth.uid()
       )
     );

   create policy "Users can insert their own bookmark tags"
     on bookmark_tags for insert
     with check (
       exists (
         select 1 from bookmarks
         where id = bookmark_id
         and user_id = auth.uid()
       )
     );

   create policy "Users can delete their own bookmark tags"
     on bookmark_tags for delete
     using (
       exists (
         select 1 from bookmarks
         where id = bookmark_id
         and user_id = auth.uid()
       )
     );

   -- Create indexes for better performance
   create index bookmarks_user_id_idx on bookmarks(user_id);
   create index bookmarks_shared_with_idx on bookmarks(shared_with);
   create index bookmarks_created_at_idx on bookmarks(created_at desc);
   create index tags_user_id_idx on tags(user_id);
   create index tags_name_idx on tags(name);
   create index bookmark_tags_bookmark_id_idx on bookmark_tags(bookmark_id);
   create index bookmark_tags_tag_id_idx on bookmark_tags(tag_id);
   ```

6. Run the development server:
   ```bash
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
