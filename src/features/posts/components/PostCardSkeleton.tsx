import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function PostCardSkeleton() {
  return (
    <Card className="p-4 w-full mx-auto">
      <div className="flex items-center space-x-3 mb-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-40 w-full mt-3 rounded-lg" />
    </Card>
  );
}

export function SinglePostSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-6 w-full mb-4" />
      <Skeleton className="w-full h-80 rounded-lg mb-6" />
    </Card>
  );
}
