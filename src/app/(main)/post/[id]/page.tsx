import PrivateRoute from "@/features/auth/guards/PrivateRoute";
import { PostDetail } from "@/features/posts/components/PostDetail";

export default async function PostDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const postId = (await params).id;

  return (
    <PrivateRoute>
      <PostDetail postId={postId} />
    </PrivateRoute>
  );
}
