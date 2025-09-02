"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "@/Components/ThemeToggle/ThemeToggle";
import { Poppins } from "next/font/google";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"; // Added useAppSelector
import { clearData } from "@/lib/redux/slices/AuthSlice";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { useTheme } from "@/lib/context/themeContext";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

const Navbar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Theme context
  const { theme } = useTheme();

  // Get username from Redux profile state
  const profile = useAppSelector((state) => state.profile.userProfile);
  const username = profile?.name || null;

  // Remove hardcoded theme set, rely on context/provider
  // document.documentElement.setAttribute("data-theme", "dark");

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const token = Cookies.get("token");
        setIsLoggedIn(!!token);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    try {
      dispatch(clearData());
      Cookies.remove("token");
      setIsLoggedIn(false);
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out");
    }
  };

  // Dynamic classes for light/dark mode
  const navBg =
    theme === "dark" ? "bg-slate-800 shadow-md" : "bg-white shadow-md";
  const textMain = theme === "dark" ? "text-slate-100" : "text-gray-700";
  const textHover =
    theme === "dark" ? "hover:text-blue-400" : "hover:text-blue-600";
  const logoText = theme === "dark" ? "text-blue-400" : "text-blue-600";

  return (
    <nav className={`${navBg} ${poppins.className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Logo + App Links */}
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

          {/* Right side: Auth Links */}
          <div className="hidden sm:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link
                  href={`/profile/${username}`}
                  className={`${textMain} ${textHover} px-3 py-2 rounded-md text-sm font-medium`}
                >
                  {username || "Profile"} {/* Show username */}
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

          {/* Mobile menu button */}
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

      {/* Mobile Menu */}
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
          <Link
            href="/explore"
            className={`block ${textMain} ${textHover} px-3 py-2 rounded-md text-base font-medium`}
          >
            Explore
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                href={`/profile/${username}`}
                className={`block ${textMain} ${textHover} px-3 py-2 rounded-md text-base font-medium`}
              >
                {username || "Profile"} {/* Show username */}
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
