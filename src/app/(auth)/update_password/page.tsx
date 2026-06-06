import PrivateRoute from "@/features/auth/guards/PrivateRoute";
import { UpdatePasswordForm } from "@/features/auth/components/UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <PrivateRoute>
      <UpdatePasswordForm />
    </PrivateRoute>
  );
}
