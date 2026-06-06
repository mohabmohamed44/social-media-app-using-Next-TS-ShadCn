"use client";

import { useMutation } from "@tanstack/react-query";
import { signIn } from "../api/authApi";
import type { LoginData } from "../types";
import { useAuthContext } from "../context/AuthProvider";

export function useLogin() {
  const { refreshAuth } = useAuthContext();

  return useMutation({
    mutationFn: (data: LoginData) => signIn(data),
    onSuccess: () => {
      refreshAuth();
    },
  });
}