import { createClient } from "@/shared/supabase/client";
import type { Comment, PostUser } from "../types";

function mapComment(row: any): Comment {
  const creator: PostUser = {
    id: row.profiles?.id ?? row.user_id,
    name: row.profiles?.name ?? "",
    photo: row.profiles?.photo ?? "",
  };
  return {
    id: row.id,
    content: row.content,
    commentCreator: creator,
    post: row.post_id,
    createdAt: row.created_at,
  };
}

export async function getComments(postId: string) {
  const supabase = createClient();
  const { data, error, count } = await supabase
    .from("comments")
    .select("id, content, post_id, user_id, created_at, profiles(id, name, photo)", { count: "exact" })
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return { comments: (data ?? []).map(mapComment), total: count ?? 0 };
}

export async function createComment(values: { content: string; post: string }) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("comments")
    .insert({ content: values.content, post_id: values.post, user_id: user!.user!.id })
    .select("id, content, post_id, user_id, created_at, profiles(id, name, photo)")
    .single();

  if (error) throw error;
  return mapComment(data);
}

export async function updateComment(commentId: string, values: { content: string }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("comments")
    .update({ content: values.content })
    .eq("id", commentId)
    .select("id, content, post_id, user_id, created_at, profiles(id, name, photo)")
    .single();

  if (error) throw error;
  return mapComment(data);
}

export async function deleteComment(commentId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) throw error;
}