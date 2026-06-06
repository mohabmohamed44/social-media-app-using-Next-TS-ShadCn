import PrivateRoute from "@/features/auth/guards/PrivateRoute";
import { CreatePostForm } from "@/features/posts/components/CreatePostForm";

export default function NewPostPage() {
  return (
    <PrivateRoute>
      <CreatePostForm />
    </PrivateRoute>
  );
}
