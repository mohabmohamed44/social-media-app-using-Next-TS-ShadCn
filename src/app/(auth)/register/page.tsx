"use client";
import PublicRoute from "@/routes/public/public.route";
import { Poppins } from "next/font/google";
import * as Yup from "yup";
import { useFormik } from "formik";
import { FormValues } from "@/types/formTypes";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { handleRegister } from "@/lib/redux/slices/AuthSlice";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/Components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Components/ui/popover";
import { Button } from "@/Components/ui/button";
import { CalendarIcon, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

// Validation Schema
const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  rePassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Repeat password is required"),
  gender: Yup.string().required("Gender is required"),
  dob: Yup.date()
    .required("Date of birth is required")
    .max(new Date(), "Date of birth cannot be in the future"),
});

export default function Page() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const formik = useFormik<FormValues & { dob: Date | null }>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      rePassword: "",
      gender: "",
      dob: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      if (isSubmitting) return; // Prevent double submission

      setIsSubmitting(true);
      try {
        const result = await dispatch(
          handleRegister({
            name: values.name,
            email: values.email,
            password: values.password,
            rePassword: values.rePassword,
            gender: values.gender,
            dateOfBirth: values.dob ? format(values.dob, "yyyy-MM-dd") : "",
          }),
        );

        // Check if the registration was successful
        if (handleRegister.fulfilled.match(result)) {
          // Check if the response indicates success
          if (result.payload.message === "success" || result.payload.token) {
            toast.success("Registration successful!");
            router.push("/login");
          } else {
            // Handle API error response
            const errorMessage =
              result.payload.message || "Registration failed";
            toast.error(errorMessage);
          }
        } else if (handleRegister.rejected.match(result)) {
          // Handle rejected promise
          let errorMessage = "Registration failed";
          if (
            result.payload &&
            typeof result.payload === "object" &&
            "message" in result.payload &&
            typeof (result.payload as any).message === "string"
          ) {
            errorMessage = (result.payload as any).message;
          } else if (
            result.error &&
            typeof result.error === "object" &&
            "message" in result.error &&
            typeof (result.error as any).message === "string"
          ) {
            errorMessage = (result.error as any).message;
          }
          toast.error(errorMessage);
        }
      } catch (error: any) {
        console.error("Registration error:", error);
        toast.error(error.message || "An unexpected error occurred");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <PublicRoute>
      <div
        className={`flex min-h-screen items-center justify-center bg-gray-100 ${poppins.className}`}
      >
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-6 text-center text-2xl font-bold tracking-tight text-gray-900">
            Sign up for your free account
          </h2>
          <form className="space-y-6" onSubmit={formik.handleSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
              />
              {formik.touched.name && formik.errors.name && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.name}
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.email}
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 pr-10 text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded p-1 text-gray-600 hover:text-gray-900"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.password}
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor="rePassword"
                className="block text-sm font-medium text-gray-700"
              >
                Repeat Password
              </label>
              <div className="relative mt-1">
                <input
                  id="rePassword"
                  name="rePassword"
                  type={showRePassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 pr-10 text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.rePassword}
                />
                <button
                  type="button"
                  onClick={() => setShowRePassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded p-1 text-gray-600 hover:text-gray-900"
                  aria-label={
                    showRePassword ? "Hide repeated password" : "Show repeated password"
                  }
                >
                  {showRePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formik.touched.rePassword && formik.errors.rePassword && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.rePassword}
                </div>
              )}
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-700">
                Gender
              </span>
              <div className="mt-1 flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    required
                    className="peer sr-only"
                    onChange={formik.handleChange}
                    checked={formik.values.gender === "male"}
                  />
                  <span className="h-4 w-4 rounded-full border border-gray-300 flex items-center justify-center peer-checked:border-black peer-checked:ring-2 peer-checked:ring-black transition">
                    <span className="h-2 w-2 rounded-full bg-black opacity-0 peer-checked:opacity-100 transition" />
                  </span>
                  <span className="text-gray-700">Male</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    required
                    className="peer sr-only"
                    onChange={formik.handleChange}
                    checked={formik.values.gender === "female"}
                  />
                  <span className="h-4 w-4 rounded-full border border-gray-300 flex items-center justify-center peer-checked:border-black peer-checked:ring-2 peer-checked:ring-black transition">
                    <span className="h-2 w-2 rounded-full bg-black opacity-0 peer-checked:opacity-100 transition" />
                  </span>
                  <span className="text-gray-700">Female</span>
                </label>
              </div>
              {formik.touched.gender && formik.errors.gender && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.gender}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={
                      `w-full justify-start text-left font-normal` +
                      (!formik.values.dob ? " text-muted-foreground" : "")
                    }
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formik.values.dob
                      ? format(formik.values.dob, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formik.values.dob || undefined}
                    onSelect={(selected) => {
                      formik.setFieldValue("dob", selected);
                    }}
                    captionLayout="dropdown"
                    fromYear={1950}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
              {formik.touched.dob && formik.errors.dob && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.dob as string}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-black hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </PublicRoute>
  );
}
