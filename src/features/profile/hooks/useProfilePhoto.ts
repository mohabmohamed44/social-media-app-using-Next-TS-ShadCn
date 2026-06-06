"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { queryKeys } from "@/shared/providers/queryKeys";
import { deleteProfilePhoto, uploadProfilePhoto } from "../api/profileApi";

export function useUploadProfilePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadProfilePhoto(file),
    onSuccess: () => {
      toast.success("Profile photo updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update photo");
    },
  });
}

export function useDeleteProfilePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteProfilePhoto(),
    onSuccess: () => {
      toast.success("Profile photo removed successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove photo");
    },
  });
}