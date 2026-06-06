"use client";

import { useRouter } from "next/navigation";
import { useEffect, type FC, type ReactNode } from "react";
import { useAuthContext } from "../context/AuthProvider";

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute: FC<PublicRouteProps> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  return <>{children}</>;
};

export default PublicRoute;