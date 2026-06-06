import { createClient } from "@/shared/supabase/client";
import type { LoginData, RegisterData, UpdatePasswordData } from "../types";

export async function signIn(data: LoginData) {
  const supabase = createClient();
  const result = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });
  if (result.error) throw result.error;
  return result;
}

export async function signUp(data: RegisterData) {
  const supabase = createClient();
  const result = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
        gender: data.gender,
        date_of_birth: data.dateOfBirth,
      },
    },
  });
  if (result.error) throw result.error;
  return result;
}

export async function changePassword(data: UpdatePasswordData) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: data.newPassword,
  });
  if (error) throw error;
}