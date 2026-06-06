"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { ThemeProvider } from "@/shared/lib/themeContext";
import { AuthProvider } from "@/features/auth/context/AuthProvider";
import { Toaster } from "react-hot-toast";

export default function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Toaster position="top-center" />
          {children}
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
