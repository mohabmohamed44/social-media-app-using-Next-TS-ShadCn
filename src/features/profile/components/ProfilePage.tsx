"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { Poppins } from "next/font/google";
import { useProfile } from "../hooks/useProfile";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import {
  useDeleteProfilePhoto,
  useUploadProfilePhoto,
} from "../hooks/useProfilePhoto";
import { useUserPosts } from "../hooks/useUserPosts";
import type { UpdateProfileData } from "../types";
import type { Post } from "@/features/posts/types";
import { getSafeImageUrl } from "@/features/posts/lib/imageUtils";
import { Button } from "@/shared/components/ui/button";

const poppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export function ProfilePage() {
  const params = useParams();
  const usernameParam = params.username as string;
  const { data: userProfile, isLoading, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadPhotoMutation = useUploadProfilePhoto();
  const deletePhotoMutation = useDeleteProfilePhoto();

  const profileUserId = userProfile?.id;
  const { data: posts = [], isLoading: loadingPosts } = useUserPosts(
    profileUserId,
    6,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
  });

  const isOwnProfile =
    !usernameParam ||
    usernameParam === "me" ||
    decodeURIComponent(usernameParam) === userProfile?.name;

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        dateOfBirth: userProfile.dateOfBirth
          ? format(new Date(userProfile.dateOfBirth), "yyyy-MM-dd")
          : "",
        gender: userProfile.gender || "",
      });
    }
  }, [userProfile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;
    const file = event.target.files[0];
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      alert("File size must be less than 3MB");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) return;
    await uploadPhotoMutation.mutateAsync(selectedFile);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleDeletePhoto = async () => {
    if (window.confirm("Are you sure you want to remove your profile photo?")) {
      await deletePhotoMutation.mutateAsync();
    }
  };

  const handleSaveProfile = async () => {
    if (!userProfile) return;
    const updateData: UpdateProfileData = {};
    if (formData.name !== userProfile.name) updateData.name = formData.name;
    if (
      formData.dateOfBirth !==
      (userProfile.dateOfBirth
        ? format(new Date(userProfile.dateOfBirth), "yyyy-MM-dd")
        : "")
    ) {
      updateData.dateOfBirth = formData.dateOfBirth;
    }
    if (formData.gender !== userProfile.gender) {
      updateData.gender = formData.gender;
    }
    if (Object.keys(updateData).length > 0) {
      await updateProfileMutation.mutateAsync(updateData);
    }
    setIsEditing(false);
  };

  if (isLoading && !userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error && !userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Failed to load profile</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Profile not found</div>
      </div>
    );
  }



  return (
    <div className={`max-w-4xl mx-auto px-4 py-8 ${poppins.className}`}>
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50 transition-colors duration-300"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
          <div className="relative w-32 h-32 mb-4 md:mb-0">
            <Image
              src={
                previewUrl ||
                getSafeImageUrl(userProfile.photo) ||
                "/default-avatar.png"
              }
              alt={userProfile.name}
              width={128}
              height={128}
              className="rounded-full w-full h-full object-cover border-2 border-gray-200"
            />
            {isOwnProfile && (
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 space-y-2 min-w-max">
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-full text-sm inline-block hover:bg-blue-600 text-center"
                >
                  Change Photo
                </label>
                {selectedFile && (
                  <div className="flex space-x-1">
                    <button
                      onClick={handleUploadPhoto}
                      className="bg-green-500 text-white px-3 py-2 rounded-full text-sm"
                    >
                      Upload
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="bg-gray-500 text-white px-3 py-2 rounded-full text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {userProfile.photo && (
                  <button
                    onClick={handleDeletePhoto}
                    className="bg-red-500 text-white px-3 py-2 rounded-full text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dateOfBirth: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, gender: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-green-500 text-white px-4 py-2 rounded-md"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center md:justify-start mb-2">
                  <h1 className="text-2xl font-bold">{userProfile.name}</h1>
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="ml-3 text-blue-500 hover:text-blue-600"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <p className="text-gray-600 mb-1">{userProfile.email}</p>
                <p className="text-gray-600">
                  Born:{" "}
                  {userProfile.dateOfBirth
                    ? format(new Date(userProfile.dateOfBirth), "MMMM dd, yyyy")
                    : "Not specified"}
                </p>
                <p className="text-gray-600">
                  Gender: {userProfile.gender || "Not specified"}
                </p>
              </>
            )}
            <div className="text-center mt-5 md:text-left">
              <Link
                href="/update_password"
              >
                <Button variant="default"className="text-sm text-white bg-blue-900 px-3 py-3 rounded-lg hover:bg-blue-700">
                  Update password
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 text-black dark:text-slate-100 border border-slate-200 dark:border-slate-700/50 transition-colors duration-300"
      >
        <h2 className="text-xl font-bold mb-4">Posts</h2>
        {loadingPosts ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post: Post) => (
              <Link
                href={`/post/${post.id}`}
                key={post.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg"
              >
                {post.image && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={getSafeImageUrl(post.image)}
                      alt={post.body || "Post image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-md font-semibold line-clamp-3 mb-3 dark:text-slate-600 text-gray-700">
                    {post.body}
                  </h2>
                  <span className="text-xs text-gray-500">
                    {post.createdAt
                      ? formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })
                      : "Some time ago"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 py-8">No posts yet</p>
        )}
      </div>
    </div>
  );
}
