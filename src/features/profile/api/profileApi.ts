import { createClient } from "@/shared/supabase/client";
import type { IUserProfile, UpdateProfileData } from "../types";

function mapProfile(row: any): IUserProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? "",
    dateOfBirth: row.date_of_birth ?? "",
    gender: row.gender ?? "",
    photo: row.photo,
  };
}

export async function getProfile() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (error) throw error;
  return { user: mapProfile(data) };
}

export async function updateProfile(profileData: UpdateProfileData) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("Not authenticated");

  const updatePayload: Record<string, string> = {};
  if (profileData.name !== undefined) updatePayload.name = profileData.name;
  if (profileData.dateOfBirth !== undefined) updatePayload.date_of_birth = profileData.dateOfBirth;
  if (profileData.gender !== undefined) updatePayload.gender = profileData.gender;

  const { data, error } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", authData.user.id)
    .select("*")
    .single();

  if (error) throw error;
  return { user: mapProfile(data) };
}

export async function uploadProfilePhoto(file: File) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("Not authenticated");

  const ext = file.name.split(".").pop();
  const path = `${authData.user.id}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);

  const { data, error } = await supabase
    .from("profiles")
    .update({ photo: urlData.publicUrl })
    .eq("id", authData.user.id)
    .select("*")
    .single();

  if (error) throw error;
  return { user: mapProfile(data) };
}

export async function deleteProfilePhoto() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("photo")
    .eq("id", authData.user.id)
    .single();

  if (profile?.photo) {
    const pathMatch = profile.photo.match(/\/avatars\/(.+)$/);
    if (pathMatch) {
      await supabase.storage.from("avatars").remove([pathMatch[1]]);
    }
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ photo: null })
    .eq("id", authData.user.id)
    .select("*")
    .single();

  if (error) throw error;
  return { user: mapProfile(data) };
}

export async function getUserPosts(userId: string, limit = 6) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, body, image, user_id, created_at, profiles(id, name, photo)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  const mappedPosts = (data ?? []).map((p) => ({
    id: p.id,
    body: p.body,
    image: p.image ?? "",
    user: {
      id: p.profiles?.[0]?.id ?? p.user_id,
      name: p.profiles?.[0]?.name ?? "",
      photo: p.profiles?.[0]?.photo ?? "",
    },
    createdAt: p.created_at,
  }));

  return { data: { posts: mappedPosts } };
}