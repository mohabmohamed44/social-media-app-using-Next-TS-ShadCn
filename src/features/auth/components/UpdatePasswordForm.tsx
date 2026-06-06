"use client";

import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { useUpdatePassword } from "../hooks/useUpdatePassword";
import type { UpdatePasswordFormValues } from "../types";

const updatePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .test(
      "passwords-different",
      "New password cannot be the same as the current password",
      function (value) {
        return this.parent.currentPassword !== value;
      },
    ),
});

export function UpdatePasswordForm() {
  const updatePasswordMutation = useUpdatePassword();

  const formik = useFormik<UpdatePasswordFormValues>({
    initialValues: {
      currentPassword: "",
      newPassword: "",
    },
    validationSchema: updatePasswordSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await updatePasswordMutation.mutateAsync({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        toast.success("Password updated successfully");
        resetForm();
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to update password");
      }
    },
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-300"
    >
      <div
        className="w-full max-w-md p-8 rounded-lg shadow bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Update Password</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {(["currentPassword", "newPassword"] as const).map((field) => (
            <div key={field}>
              <label htmlFor={field} className="block text-sm font-medium mb-1">
                {field === "currentPassword"
                  ? "Current Password"
                  : "New Password"}
              </label>
              <input
                type="password"
                id={field}
                name={field}
                value={formik.values[field]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-1 block w-full px-4 py-2 border rounded-md"
                disabled={updatePasswordMutation.isPending}
              />
              {formik.touched[field] && formik.errors[field] && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors[field]}
                </p>
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={updatePasswordMutation.isPending || !formik.isValid}
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md disabled:opacity-50"
          >
            {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
