"use client";

import { useState } from "react";
import { Poppins } from "next/font/google";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePosts } from "../hooks/usePosts";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export function PostFeed() {
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = usePosts(currentPage, 10);

  const posts = data?.posts ?? [];
  const totalPages = data?.paginationInfo?.numberOfPages ?? 1;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

    return (
      <div
        className={`flex justify-center items-center space-x-2 mt-6 ${poppins.className}`}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pageNumbers.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page)}
            disabled={isLoading}
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className={`max-w-2xl mx-auto ${poppins.className}`}>
        <div className="grid grid-cols-1 gap-4">
          {[...Array(5)].map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center text-red-500">
        <p>Error loading posts</p>
        <Button onClick={() => refetch()} className="mt-4">
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${poppins.className}`}>
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              onUpdated={() => refetch()}
            />
          ))}
            {posts.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm max-w-md mx-auto my-8">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full mb-4 animate-bounce-subtle">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  No Posts Yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-6">
                  The feed is currently empty. Be the first to share your thoughts and stories with the community!
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all duration-200 hover:scale-[1.02]">
                  <Link href="/post/new">Create First Post</Link>
                </Button>
              </div>
            )}
        </div>
      </div>
      {renderPagination()}
    </div>
  );
}
