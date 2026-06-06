"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { queryKeys } from "@/shared/providers/queryKeys";
import { updateProfile } from "../api/profileApi";
import type { UpdateProfileData } from "../types";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => updateProfile(data),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}