import PrivateRoute from "@/features/auth/guards/PrivateRoute";
import { PostFeed } from "@/features/posts/components/PostFeed";

export default function FeedPage() {
  return (
    <PrivateRoute>
      <PostFeed />
    </PrivateRoute>
  );
}
