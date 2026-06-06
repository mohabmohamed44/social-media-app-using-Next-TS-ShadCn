"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuthContext } from "../context/AuthProvider";

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        setChecked(true);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (!checked) return null;
  return <>{children}</>;
}