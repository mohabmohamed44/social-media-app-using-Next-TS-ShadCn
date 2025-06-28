import React from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { UpdatePasswordFormValues } from "@/types/updateFormType";
import "@/styles/theme.css";
import { toast } from "react-hot-toast";
import {
  setNewPassword,
  setPassword,
  clearError,
} from "@/lib/redux/slices/UpdatePasswordSlice";

// Import the async thunk - you'll need to export this from your slice file
import { updatePassword } from "@/lib/redux/slices/UpdatePasswordSlice";

// Yup Schema for UpdatePasswordPage
const updatePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    )
    .test(
      "passwords-different",
      "New password cannot be the same as the current password",
      function (value) {
        return this.parent.currentPassword !== value;
      },
    ),
});

export default function UpdatePasswordForm() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: any) => state.updatePassword);

  // formik initialization
  const formik = useFormik<UpdatePasswordFormValues>({
    initialValues: {
      currentPassword: "",
      newPassword: "",
    },
    validationSchema: updatePasswordSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        // Clear any previous errors
        dispatch(clearError());

        // Dispatch the async thunk
        const result = await dispatch(
          updatePassword({
            password: values.currentPassword,
            newPassword: values.newPassword,
          }) as any, // Fixes type error for dispatching thunk
        );

        if ((updatePassword as any).fulfilled.match(result)) {
          toast.success("Password updated successfully");
          resetForm();
        } else {
          // result.payload may be undefined or not a string, so fallback to string
          const errorMessage =
            (result && typeof result.payload === "string" && result.payload) ||
            "Failed to update password";
          toast.error(errorMessage);
        }
      } catch (error) {
        toast.error("Failed to update password");
      }
    },
  });

  // Clear error when component unmounts or when inputs change
  React.useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.currentPassword, formik.values.newPassword]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors"
      style={{
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
      }}
    >
      <div
        className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow"
        style={{
          backgroundColor: "var(--2nd-bg-color)",
          color: "var(--2nd-text-color)",
        }}
      >
        <h2
          className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center"
          style={{
            color: "var(--text-color)",
          }}
        >
          Update Password
        </h2>
        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              style={{ color: "var(--text-color)" }}
            >
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              placeholder="Enter your current password"
              value={formik.values.currentPassword}
              onChange={(e) => {
                formik.handleChange(e);
                dispatch(setPassword(e.target.value));
              }}
              onBlur={formik.handleBlur}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            {formik.touched.currentPassword &&
              formik.errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formik.errors.currentPassword}
                </p>
              )}
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              style={{ color: "var(--text-color)" }}
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="Enter Your new Password"
              value={formik.values.newPassword}
              onChange={(e) => {
                formik.handleChange(e);
                dispatch(setNewPassword(e.target.value));
              }}
              onBlur={formik.handleBlur}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            {formik.touched.newPassword && formik.errors.newPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {formik.errors.newPassword}
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !formik.isValid}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
