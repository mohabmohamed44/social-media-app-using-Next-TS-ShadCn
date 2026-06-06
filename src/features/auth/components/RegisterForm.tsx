"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import { format } from "date-fns";
import * as Yup from "yup";
import { useFormik } from "formik";
import { CalendarIcon, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { useRegister } from "../hooks/useRegister";
import type { RegisterFormValues } from "../types";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

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

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const formik = useFormik<RegisterFormValues>({
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
      try {
const result = await registerMutation.mutateAsync({
          name: values.name,
          email: values.email,
          password: values.password,
          rePassword: values.rePassword,
          gender: values.gender,
          dateOfBirth: values.dob ? format(values.dob, "yyyy-MM-dd") : "",
        });
        toast.success("Registration successful!");
        router.push("/login");
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Registration failed";
        toast.error(message);
      }
    },
  });

  return (
    <div
      className={`flex min-h-screen items-center justify-center bg-gray-100 ${poppins.className}`}
    >
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold tracking-tight text-gray-900">
          Sign up for your free account
        </h2>
        <form className="space-y-6" onSubmit={formik.handleSubmit}>
          {(["name", "email"] as const).map((field) => (
            <div key={field}>
              <label
                htmlFor={field}
                className="block text-sm font-medium text-gray-700 capitalize"
              >
                {field}
              </label>
              <input
                id={field}
                name={field}
                type={field === "email" ? "email" : "text"}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values[field]}
              />
              {formik.touched[field] && formik.errors[field] && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors[field]}
                </div>
              )}
            </div>
          ))}
          {(["password", "rePassword"] as const).map((field) => (
            <div key={field}>
              <label
                htmlFor={field}
                className="block text-sm font-medium text-gray-700"
              >
                {field === "password" ? "Password" : "Repeat Password"}
              </label>
              <div className="relative mt-1">
                <input
                  id={field}
                  name={field}
                  type={
                    (field === "password" ? showPassword : showRePassword)
                      ? "text"
                      : "password"
                  }
                  required
                  className="block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 pr-10"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values[field]}
                />
                <button
                  type="button"
                  onClick={() =>
                    field === "password"
                      ? setShowPassword((s) => !s)
                      : setShowRePassword((s) => !s)
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                >
                  {(field === "password" ? showPassword : showRePassword) ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {formik.touched[field] && formik.errors[field] && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors[field]}
                </div>
              )}
            </div>
          ))}
          <div>
            <span className="block text-sm font-medium text-gray-700">
              Gender
            </span>
            <div className="mt-1 flex items-center space-x-4">
              {(["male", "female"] as const).map((value) => (
                <label key={value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    onChange={formik.handleChange}
                    checked={formik.values.gender === value}
                  />
                  <span className="capitalize">{value}</span>
                </label>
              ))}
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
                <Button variant="outline" className="w-full justify-start" type="button">
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
                  onSelect={(selected) => formik.setFieldValue("dob", selected)}
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
            disabled={registerMutation.isPending}
            className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {registerMutation.isPending ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-black hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
