"use client";

import { useMutation } from "@tanstack/react-query";
import { signUp } from "../api/authApi";
import type { RegisterData } from "../types";

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterData) => signUp(data),
  });
}