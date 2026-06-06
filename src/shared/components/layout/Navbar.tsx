"use client";

import React, { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/shared/components/layout/ThemeToggle";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/features/auth/hooks/useAuth";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const username = user?.name ?? null;

  const handleLogout = () => {
    try {
      logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out");
    }
  };

  const navBg = "bg-white dark:bg-slate-800 shadow-md";
  const textMain = "text-gray-700 dark:text-slate-100";
  const textHover = "hover:text-blue-600 dark:hover:text-blue-400";
  const logoText = "text-blue-600 dark:text-blue-400";

  return (
    <nav className={`${navBg} ${poppins.className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className={`text-xl font-bold ${logoText}`}>
              LinkedPosts
            </Link>
            <div className="hidden sm:flex space-x-4">
              <Link
                href="/post"
                className={`${textMain} ${textHover} px-3 py-2 rounded-md text-sm font-medium`}
              >
                Posts
              </Link>
              <Link
                href="/post/new"
                className={`${textMain} ${textHover} px-3 py-2 rounded-md text-sm font-medium`}
              >
                Create
              </Link>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href={`/profile/${username ?? "me"}`}
                  className={`${textMain} ${textHover} px-3 py-2 rounded-md text-sm font-medium`}
                >
                  {username || "Profile"}
                </Link>
                <button
                  onClick={handleLogout}
                  className={`${textMain} ${textHover} px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Logout
                </button>
                <ThemeToggle />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`${textMain} ${textHover} px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`${textMain} ${textHover} px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="flex sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md ${textMain} ${textHover} focus:outline-none`}
              aria-expanded={menuOpen}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/post"
            className={`block ${textMain} ${textHover} px-3 py-2 rounded-md text-base font-medium`}
          >
            Posts
          </Link>
          <Link
            href="/post/new"
            className={`block ${textMain} ${textHover} px-3 py-2 rounded-md text-base font-medium`}
          >
            Create
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href={`/profile/${username ?? "me"}`}
                className={`block ${textMain} ${textHover} px-3 py-2 rounded-md text-base font-medium`}
              >
                {username || "Profile"}
              </Link>
              <button
                onClick={handleLogout}
                className={`block w-full text-left ${textMain} ${textHover} px-3 py-2 rounded-md text-base font-medium`}
              >
                Logout
              </button>
              <div className="px-3 py-2">
                <ThemeToggle />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`block ${textMain} ${textHover} px-3 py-2 rounded-md text-base font-medium`}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={`block ${textMain} ${textHover} px-3 py-2 rounded-md text-base font-medium`}
              >
                Register
              </Link>
              <div className="px-3 py-2">
                <ThemeToggle />
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
