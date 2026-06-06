"use client";

import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../api/authApi";
import type { UpdatePasswordData } from "../types";

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: UpdatePasswordData) => changePassword(data),
  });
}