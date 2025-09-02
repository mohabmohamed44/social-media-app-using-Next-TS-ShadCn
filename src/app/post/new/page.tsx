"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { Upload, X } from "lucide-react";
import Cookies from "js-cookie";
import { getCookie } from "cookies-next";
import { toast } from "react-hot-toast";
import { Poppins } from "next/font/google";
import PrivateRoute from "@/routes/private/private.route";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { createPost, resetPostState } from "@/lib/redux/slices/CreatePostSlice";
import { RootState, AppDispatch } from "@/lib/redux/store";
import "@/styles/theme.css";

// Form validation schema
const validationSchema = Yup.object().shape({
  body: Yup.string()
    .trim()
    .required("Post content is required")
    .min(1, "Post content cannot be empty")
    .max(5000, "Post content cannot exceed 5000 characters"),
});

const initialValues = {
  body: "",  
};

// font setup for the page
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

// Constants
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export default function NewPostPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [postWithoutImage, setPostWithoutImage] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Get state from Redux store
  const { loading, error, success } = useSelector(
    (state: RootState) => state.createPost
  );

  // Cleanup function for image preview URL
  const cleanupImagePreview = useCallback(() => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
  }, [imagePreviewUrl]);

  // Validate file function
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "Please select a valid image file (JPEG, PNG, GIF, WebP)";
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return "Image size should be less than 3MB";
    }
    
    return null;
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) return;

    const file = files[0];
    const validationError = validateFile(file);
    
    if (validationError) {
      toast.error(validationError);
      // Reset the input
      e.target.value = '';
      return;
    }
    
    // Clean up previous image preview
    cleanupImagePreview();
    
    setSelectedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setPostWithoutImage(false);
  };

  // Remove selected image
  const removeImage = () => {
    cleanupImagePreview();
    setSelectedImage(null);
    setPostWithoutImage(false);
    
    // Reset file input
    const fileInput = document.getElementById("image-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async (values: typeof initialValues) => {
    const token = getCookie("token") || Cookies.get("token");
    
    if (!token) {
      toast.error("Please log in to create a post");
      router.push("/login");
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting || loading) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append("body", values.body.trim());
      
      // Only append image if one is selected and user hasn't opted to post without image
      if (selectedImage && !postWithoutImage) {
        formData.append("image", selectedImage);
      }

      await dispatch(createPost(formData)).unwrap();
    } catch (err: any) {
      console.error("Error creating post:", err);
      // Error is handled by Redux state and useEffect below
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize formik
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
    validateOnBlur: true,
    validateOnChange: true,
  });

  // Handle success and error messages
  useEffect(() => {
    if (success) {
      toast.success("Post created successfully!");
      formik.resetForm();
      removeImage();
      setPostWithoutImage(false);
      dispatch(resetPostState());
      router.push("/post");
    }
  }, [success, dispatch, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetPostState());
    }
  }, [error, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupImagePreview();
      dispatch(resetPostState());
    };
  }, [cleanupImagePreview, dispatch]);

  // Handle checkbox change
  const handlePostWithoutImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setPostWithoutImage(checked);
    
    if (checked && selectedImage) {
      removeImage();
    }
  };

  const isFormDisabled = loading || isSubmitting;
  const canSubmit = formik.isValid && formik.values.body.trim().length > 0 && !isFormDisabled;

  return (
    <PrivateRoute>
      <div className={`container mx-auto px-4 py-8 max-w-2xl ${poppins.className}`}>
        <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
        
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Post Content */}
          <div>
            <label htmlFor="body" className="block text-sm font-medium mb-2">
              What's on your mind?
            </label>
            <textarea
              id="body"
              name="body"
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                formik.touched.body && formik.errors.body 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Share your thoughts..."
              value={formik.values.body}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isFormDisabled}
              maxLength={5000}
            />
            <div className="flex justify-between items-center mt-1">
              <div>
                {formik.touched.body && formik.errors.body && (
                  <p className="text-sm text-red-600">{formik.errors.body}</p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {formik.values.body.length}/5000
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                Add an image (optional)
              </label>
              {selectedImage && !postWithoutImage && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition-colors"
                  disabled={isFormDisabled}
                >
                  <X size={14} />
                  Remove
                </button>
              )}
            </div>

            {/* Image Upload Area */}
            {!selectedImage && !postWithoutImage && (
              <div className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center items-center">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none transition-colors"
                    >
                      <span>Upload a file</span>
                      <input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isFormDisabled}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-sm md:text-lg text-gray-500">
                    PNG, JPG, GIF, WebP up to 3MB Max..
                  </p>
                </div>
              </div>
            )}

            {/* Image Preview */}
            {imagePreviewUrl && !postWithoutImage && (
              <div className="mt-2 relative">
                <img
                  src={imagePreviewUrl}
                  alt="Preview"
                  className="h-48 w-full object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                  disabled={isFormDisabled}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Post without image checkbox */}
            <div className="mt-3 flex items-center">
              <input
                id="post-without-image"
                name="post-without-image"
                type="checkbox"
                checked={postWithoutImage}
                onChange={handlePostWithoutImageChange}
                disabled={isFormDisabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="post-without-image"
                className="ml-2 block text-sm text-gray-700"
              >
                Post without an image
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={!canSubmit}
            >
              {isFormDisabled ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Posting...
                </div>
              ) : (
                "Create Post"
              )}
            </Button>
          </div>
        </form>
      </div>
    </PrivateRoute>
  );
}