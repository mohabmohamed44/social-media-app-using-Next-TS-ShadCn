-- ========================================
-- Supabase Schema for LinkedPosts App
-- ========================================

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text,
  date_of_birth date,
  gender text check (gender in ('male', 'female')),
  photo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Posts table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  body text not null,
  image text,
  user_id uuid references public.profiles on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

create policy "Authenticated users can create posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on public.posts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  using (auth.uid() = user_id);

-- Comments table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Authenticated users can create comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own comments"
  on public.comments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.comments for delete
  using (auth.uid() = user_id);

-- Indexes for performance
create index idx_posts_user_id on public.posts (user_id);
create index idx_posts_created_at on public.posts (created_at desc);
create index idx_comments_post_id on public.comments (post_id);
create index idx_comments_user_id on public.comments (user_id);

-- Storage bucket for profile photos
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

create policy "Anyone can view avatar photos"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid() = (storage.foldername(name))[1]);

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid() = (storage.foldername(name))[1]);

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid() = (storage.foldername(name))[1]);

-- Storage bucket for post images
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true);

create policy "Anyone can view post images"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "Authenticated users can upload post images"
  on storage.objects for insert
  with check (bucket_id = 'post-images' and auth.role() = 'authenticated');

create policy "Users can update their own post images"
  on storage.objects for update
  using (bucket_id = 'post-images' and auth.uid() = owner);

create policy "Users can delete their own post images"
  on storage.objects for delete
  using (bucket_id = 'post-images' and auth.uid() = owner);

-- Updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_posts_updated_at
  before update on public.posts
  for each row execute procedure public.update_updated_at_column();

create trigger update_comments_updated_at
  before update on public.comments
  for each row execute procedure public.update_updated_at_column();