"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchUserPosts
} from "@/lib/redux/slices/getUserPostsSlice";
import {
  getUserProfile,
  updateUserProfile,
  clearError,
  IUpdateProfileData,
} from "@/lib/redux/slices/LoggedInUserData";
import "@/styles/theme.css";
import { Poppins } from "next/font/google";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  uploadProfilePhoto,
  deleteProfilePhoto,
  setSelectedFile,
  clearSelectedFile,
  clearUploadError,
  setPreviewUrl,
} from "@/lib/redux/slices/ProfilePhotoSlice";
import Link from "next/link";
// Add Post type import from existing interface
import { postInterface } from "@/interfaces/ICreatePost";

const poppins = Poppins({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export default function ProfilePage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  // Get state from all slices
  const profileState = useAppSelector((state) => state.profile);
  const profilePhotoState = useAppSelector((state) => state.profilePhoto);
  const { posts, loading: loadingPosts, error: postsError } = useAppSelector((state) => state.userPosts);

  // Handle case where profile state might be undefined
  const { userProfile, loading, error, updating } = profileState || {
    userProfile: null,
    loading: false,
    error: null,
    updating: false,
  };

  const { uploadingPhoto, uploadError, previewUrl, selectedFile } =
    profilePhotoState || {
      uploadingPhoto: false,
      uploadError: null,
      previewUrl: null,
      selectedFile: null,
    };

  const [isEditing, setIsEditing] = useState(false);

  // Form states for editing
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
  });
  
  useEffect(() => {
    const loadData = async () => {
      await dispatch(getUserProfile());
      // Fetch user posts after profile is loaded
      if (userProfile?._id) {
        dispatch(fetchUserPosts({ userId: userProfile._id, limit: 6 }));
      }
    };
    
    loadData();
    
    return () => {
      dispatch(clearError());
      dispatch(clearUploadError());
    };
  }, [dispatch, userProfile?._id]);

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
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (3MB limit to account for base64 encoding overhead)
      if (file.size > 3 * 1024 * 1024) {
        alert("File size must be less than 3MB");
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      dispatch(setSelectedFile({ file, previewUrl }));
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) return;

    try {
      await dispatch(uploadProfilePhoto(selectedFile)).unwrap();
      // Refresh profile data
      dispatch(getUserProfile());
    } catch (error) {
      console.error("Failed to upload photo:", error);
    }
  };

  const handleDeletePhoto = async () => {
    if (window.confirm("Are you sure you want to remove your profile photo?")) {
      try {
        await dispatch(deleteProfilePhoto()).unwrap();
        dispatch(getUserProfile());
      } catch (error) {
        console.error("Failed to delete photo:", error);
      }
    }
  };

  const handleClearSelectedFile = () => {
    dispatch(clearSelectedFile());
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data when canceling
      if (userProfile) {
        setFormData({
          name: userProfile.name || "",
          dateOfBirth: userProfile.dateOfBirth
            ? format(new Date(userProfile.dateOfBirth), "yyyy-MM-dd")
            : "",
          gender: userProfile.gender || "",
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    try {
      const updateData: IUpdateProfileData = {};

      // Only include changed fields
      if (formData.name !== userProfile?.name) {
        updateData.name = formData.name;
      }
      if (
        formData.dateOfBirth !==
        (userProfile?.dateOfBirth
          ? format(new Date(userProfile.dateOfBirth), "yyyy-MM-dd")
          : "")
      ) {
        updateData.dateOfBirth = formData.dateOfBirth;
      }
      if (formData.gender !== userProfile?.gender) {
        updateData.gender = formData.gender;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        await dispatch(updateUserProfile(updateData)).unwrap();
        setIsEditing(false);
      } else {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (loading && !userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">{error}</div>
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
      {/* Profile Header */}
      <div
        className="bg-white rounded-lg shadow-md p-6 mb-6"
        style={{
          backgroundColor: "var(--2nd-bg-color)",
          color: "var(--2nd-text-color)",
        }}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
          {/* Profile Photo Section */}
          <div className="relative w-32 h-32 mb-4 md:mb-0">
            <img
              src={previewUrl || userProfile.photo || "/default-avatar.png"}
              alt={userProfile.name}
              className="rounded-full w-full h-full object-cover border-2 border-gray-200"
            />
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 space-y-2 min-w-max">
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploadingPhoto}
              />
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="photo-upload"
                  className={`cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-full text-sm inline-block hover:bg-blue-600 transition-colors text-center ${
                    uploadingPhoto ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {uploadingPhoto ? "Processing..." : "Change Photo"}
                </label>

                {selectedFile && (
                  <div className="flex space-x-1">
                    <button
                      onClick={handleUploadPhoto}
                      disabled={uploadingPhoto}
                      className={`bg-green-500 text-white px-3 py-2 rounded-full text-sm hover:bg-green-600 transition-colors ${
                        uploadingPhoto ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      Upload
                    </button>
                    <button
                      onClick={handleClearSelectedFile}
                      disabled={uploadingPhoto}
                      className="bg-gray-500 text-white px-3 py-2 rounded-full text-sm hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="flex-1">
            <div className="text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={updating}
                      className={`bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors ${
                        updating ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {updating ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleEditToggle}
                      disabled={updating}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center md:justify-start mb-2">
                    <h1 className="text-2xl font-bold dark:text-white mt-3">
                      {userProfile.name}
                    </h1>
                    <button
                      onClick={handleEditToggle}
                      className="ml-3 mt-3 text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  </div>
                  <p className="text-gray-600 mb-1">{userProfile.email}</p>
                  <p className="text-gray-600">
                    Born:{" "}
                    {userProfile.dateOfBirth
                      ? format(
                          new Date(userProfile.dateOfBirth),
                          "MMMM dd, yyyy",
                        )
                      : "Not specified"}
                  </p>
                  <p className="text-gray-600">
                    Gender: {userProfile.gender || "Not specified"}
                  </p>
                </>
              )}

              {/* Error Messages */}
              {error && (
                <div className="mt-2 text-red-600 text-sm">
                  Profile Error: {error}
                </div>
              )}
              {uploadError && (
                <div className="mt-2 text-red-600 text-sm">
                  Photo Error: {uploadError}
                </div>
              )}
            </div>

            {/* Stats Section */}
            {!isEditing && (
              <div className="flex justify-center md:justify-start space-x-6 mt-6">
                <div className="text-center">
                  <div className="text-gray-600 text-sm">Posts</div>
                  <div className="font-bold">{userProfile.posts || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600 text-sm">Followers</div>
                  <div className="font-bold">{userProfile.followers || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600 text-sm">Following</div>
                  <div className="font-bold">{userProfile.following || 0}</div>
                </div>
              </div>
            )}
            <div className="text-gray-600 text-center mt-5 flex justify-center md:justify-start items-center">
              <Link
                href="/update_password"
                className="text-sm md:text-lg text-white bg-blue-900 px-3 py-3 rounded-lg hover:bg-blue-700 hover:transition-colors hover:duration-300 dark:text-gray-400"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div
        className="bg-white rounded-lg shadow-md p-6"
        style={{
          backgroundColor: "var(--2nd-bg-color)",
          color: "var(--text-color)",
        }}
      >
        <h2 className="text-xl font-bold mb-4">Posts</h2>
        {loadingPosts ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : postsError ? (
          <div className="text-red-500 text-center py-4">Error loading posts: {postsError}</div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post: postInterface) => (
              <Link href={`/post/${post._id}`} 
                key={post._id} 
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                {post.image && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={post.image}
                      alt={post.body || 'Post image'}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                    <h2 className="text-gray-800  dark:text-gray-300 text-md font-semibold line-clamp-3 mb-3">
                    {post.body}
                  </h2>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Some time ago'}</span>
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post?.comments?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              <svg className="w-16 h-16 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300">No posts yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">When you create posts, they'll appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
