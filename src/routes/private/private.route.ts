"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";

interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * PrivateRoute component protects authenticated routes from unauthorized access.
 * Checks for authentication token and redirects to login page if not present.
 *
 * @component
 * @param {PrivateRouteProps} props - Component props
 * @param {React.ReactNode} props.children - Content to render when authenticated
 * @returns {React.ReactNode|null} Returns children if authenticated, null otherwise
 */

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getCookie("token"); // Check for token in cookies

    if (!token) {
      router.push("/login"); // Redirect to login if no token
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return null; // Or a loading spinner
  }

  return children;
}
