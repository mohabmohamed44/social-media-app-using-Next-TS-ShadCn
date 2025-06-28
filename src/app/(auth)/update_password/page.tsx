"use client";
import UpdatePasswordForm from "@/Components/UpdatePasswordForm/UpdatePasswordForm";
import { useTheme } from "@/lib/context/themeContext";
import { Poppins } from "next/font/google";
import * as Yup from "yup";
import { useFormik } from "formik";
import "@/styles/theme.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export default function UpdatePasswordPage() {
  const { theme } = useTheme();
  return (
    <div
      className={`${poppins.className}`}
      style={{
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
      }}
    >
      <UpdatePasswordForm />
    </div>
  );
}
