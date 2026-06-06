"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Upload, X } from "lucide-react";
import { Poppins } from "next/font/google";
import { toast } from "react-hot-toast";
import { Button } from "@/shared/components/ui/button";
import Image from "next/image";
import { useCreatePost } from "../hooks/useCreatePost";
import { Textarea } from "@/shared/components/ui/textarea";
import { Checkbox } from "@/shared/components/ui/checkbox";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const validationSchema = Yup.object().shape({
  body: Yup.string()
    .trim()
    .required("Post content is required")
    .min(1, "Post content cannot be empty")
    .max(5000, "Post content cannot exceed 5000 characters"),
});

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

export function CreatePostForm() {
  const router = useRouter();
  const createPostMutation = useCreatePost();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [postWithoutImage, setPostWithoutImage] = useState(false);

  const cleanupImagePreview = useCallback(() => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
  }, [imagePreviewUrl]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "Please select a valid image file (JPEG, PNG, GIF, WebP)";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Image size should be less than 3MB";
    }
    return null;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) return;

    const file = files[0];
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      e.target.value = "";
      return;
    }

    cleanupImagePreview();
    setSelectedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setPostWithoutImage(false);
  };

  const removeImage = () => {
    cleanupImagePreview();
    setSelectedImage(null);
    setPostWithoutImage(false);
    const fileInput = document.getElementById(
      "image-upload",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const formik = useFormik({
    initialValues: { body: "" },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("body", values.body.trim());
        if (selectedImage && !postWithoutImage) {
          formData.append("image", selectedImage);
        }
        await createPostMutation.mutateAsync(formData);
        toast.success("Post created successfully!");
        formik.resetForm();
        removeImage();
        router.push("/post");
      } catch (err: unknown) {
        const errorResponse = err as any;
        const message =
          (errorResponse?.response?.data?.message as string) ||
          (errorResponse?.message as string) ||
          "Failed to create post";
        toast.error(message);
      }
    },
  });

  const isFormDisabled = createPostMutation.isPending;
  const canSubmit =
    formik.isValid &&
    formik.values.body.trim().length > 0 &&
    !isFormDisabled;

  return (
    <div className={`container mx-auto px-4 py-8 max-w-2xl ${poppins.className}`}>
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-md transition-all duration-300">
        <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-50">Create New Post</h1>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              What&apos;s on your mind?
            </label>
            <Textarea
              id="body"
              name="body"
              className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 min-h-[120px] resize-y ${
                formik.touched.body && formik.errors.body
                  ? "border-red-500"
                  : "border-gray-200 dark:border-slate-800"
              }`}
              placeholder="Share your thoughts..."
              value={formik.values.body}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isFormDisabled}
              maxLength={5000}
            />
            <div className="flex justify-between items-center mt-1.5">
              <div>
                {formik.touched.body && formik.errors.body && (
                  <p className="text-sm text-red-600">{formik.errors.body}</p>
                )}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {formik.values.body.length}/5000
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-350">
                Add an image (optional)
              </label>
              {selectedImage && !postWithoutImage && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                  disabled={isFormDisabled}
                >
                  <X size={14} />
                  Remove
                </button>
              )}
            </div>
            {!selectedImage && !postWithoutImage && (
              <div className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-slate-200 dark:border-slate-800 border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                  <label
                    htmlFor="image-upload"
                    className="relative cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium"
                  >
                    <span>Upload a file</span>
                    <input
                      id="image-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isFormDisabled}
                    />
                  </label>
                </div>
              </div>
            )}
            {imagePreviewUrl && !postWithoutImage && (
              <div className="mt-2 relative">
                <Image
                  src={imagePreviewUrl}
                  alt="Preview"
                  width={330}
                  height={450}
                  className="h-48 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                />
              </div>
            )}
            <div className="mt-4 flex items-center">
              <Checkbox
                id="post-without-image"
                checked={postWithoutImage}
                onCheckedChange={(checked) => {
                  setPostWithoutImage(checked as boolean);
                  if (checked && selectedImage) removeImage();
                }}
                disabled={isFormDisabled}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="post-without-image" className="ml-2.5 text-sm text-slate-600 dark:text-slate-400 select-none">
                Post without an image
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full py-6 rounded-xl text-base font-semibold shadow-md transition-all duration-200 hover:scale-[1.01]" disabled={!canSubmit}>
            {isFormDisabled ? "Posting..." : "Create Post"}
          </Button>
        </form>
      </div>
    </div>
  );
}
