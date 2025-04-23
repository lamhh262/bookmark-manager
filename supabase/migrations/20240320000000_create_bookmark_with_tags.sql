-- Create a function to handle bookmark and tag creation in a transaction
create or replace function create_bookmark_with_tags(
  p_user_id uuid,
  p_url text,
  p_title text,
  p_description text,
  p_is_public boolean,
  p_tags text[]
)
returns bookmarks
language plpgsql
security definer
as $$
declare
  v_bookmark bookmarks;
  v_tag text;
begin
  -- Start transaction
  begin
    -- Create the bookmark
    insert into bookmarks (
      user_id,
      url,
      title,
      description,
      is_public
    ) values (
      p_user_id,
      p_url,
      p_title,
      p_description,
      p_is_public
    ) returning * into v_bookmark;

    -- Create tags if they exist
    if array_length(p_tags, 1) > 0 then
      foreach v_tag in array p_tags
      loop
        insert into tags (
          user_id,
          name,
          bookmark_id
        ) values (
          p_user_id,
          v_tag,
          v_bookmark.id
        );
      end loop;
    end if;

    return v_bookmark;
  exception
    when others then
      -- Rollback the transaction
      raise exception 'Error creating bookmark with tags: %', SQLERRM;
  end;
end;
$$;
