import PublicRoute from "@/features/auth/guards/PublicRoute";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <PublicRoute>
      <RegisterForm />
    </PublicRoute>
  );
}
