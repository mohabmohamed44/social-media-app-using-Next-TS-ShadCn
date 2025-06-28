"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { FC, ReactNode } from "react";
import Cookies from "js-cookie"; // Use js-cookie for client-side cookies

/**
 * PublicRoute component protects public routes from authenticated users.
 * Automatically redirects to home page if a valid token exists in cookies.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render for public access
 * @returns {React.ReactElement} Returns child components if user is not authenticated
 *
 *
 */

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute: FC<PublicRouteProps> = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.push("/"); // Navigate to the home page or another appropriate route
    }
  }, [router]);

  return children;
};

export default PublicRoute;
