import { createClient } from "@/shared/supabase/client";
import type { Post, PostsResponse, PostUser } from "../types";

function mapPostUser(profile: { id: string; name: string; photo: string | null }): PostUser {
  return {
    id: profile.id,
    name: profile.name,
    photo: profile.photo ?? "",
  };
}

function mapPost(row: any): Post {
  return {
    id: row.id,
    body: row.body,
    image: row.image ?? "",
    user: mapPostUser(row.user_id ? row.profiles ?? row.user : { id: row.user_id, name: "", photo: null }),
    createdAt: row.created_at,
    commentsCount: row.comments?.length ?? row.comments_count ?? 0,
  };
}

export async function getPosts(page = 1, limit = 10): Promise<PostsResponse> {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const [{ data: posts, count, error }, { data: commentCounts }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, body, image, user_id, created_at, profiles(id, name, photo)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase
      .from("comments")
      .select("post_id"),
  ]);

  if (error) throw error;

  const countMap = new Map<string, number>();
  for (const c of commentCounts ?? []) {
    countMap.set(c.post_id, (countMap.get(c.post_id) ?? 0) + 1);
  }

  const mappedPosts = (posts ?? []).map((p) => ({
    ...mapPost(p),
    commentsCount: countMap.get(p.id) ?? 0,
  }));

  return {
    posts: mappedPosts,
    paginationInfo: {
      numberOfPages: Math.ceil((count ?? 0) / limit),
      total: count ?? 0,
    },
  };
}

export async function getLatestPosts(): Promise<PostsResponse> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, body, image, user_id, created_at, profiles(id, name, photo)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return { posts: (data ?? []).map(mapPost) };
}

export async function getPost(postId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, body, image, user_id, created_at, profiles(id, name, photo)")
    .eq("id", postId)
    .single();

  if (error) throw error;
  return { post: mapPost(data) };
}

export async function createPost(formData: FormData) {
  const supabase = createClient();
  const body = formData.get("body") as string;
  const imageFile = formData.get("image") as File | null;

  // Fetch user upfront – needed for both the upload path and the post insert
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error("You must be logged in to create a post");

  let imageUrl = "";
  if (imageFile) {
    const ext = imageFile.name.split(".").pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(path, imageFile, { cacheControl: "3600", upsert: false, contentType: imageFile.type });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      const details =
        typeof uploadError === "string"
          ? uploadError
          : uploadError?.message || JSON.stringify(uploadError);
      const err: any = new Error(`Upload failed: ${details}`);
      err.status = uploadError?.status;
      err.original = uploadError;
      throw err;
    }

    const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);
    imageUrl = urlData.publicUrl;
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({ body, image: imageUrl, user_id: userId })
    .select("id, body, image, user_id, created_at, profiles(id, name, photo)")
    .single();

  if (error) throw error;
  return mapPost(data);
}

export async function updatePost(postId: string, values: { body: string }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("posts")
    .update({ body: values.body })
    .eq("id", postId)
    .select("id, body, image, user_id, created_at, profiles(id, name, photo)")
    .single();

  if (error) throw error;
  return { post: mapPost(data) };
}

export async function deletePost(postId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;
}

export async function likePost(postId: string) {
  const supabase = createClient();
  const {data: user} = await supabase.auth.getUser();
  const userId = user?.user?.id;
  if (!userId) throw new Error("You must be logged in to like a post");

  // Check if like already exists
  const { data: existing, error: selectError } = await supabase
    .from("likes")
    .select("id, post_id, user_id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return existing;

  const { data: inserted, error: insertError } = await supabase
    .from("likes")
    .insert({ post_id: postId, user_id: userId })
    .select()
    .single();

  if (insertError) throw insertError;
  return inserted;
}