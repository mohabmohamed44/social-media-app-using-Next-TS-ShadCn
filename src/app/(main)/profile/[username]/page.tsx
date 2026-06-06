import PrivateRoute from "@/features/auth/guards/PrivateRoute";
import { ProfilePage } from "@/features/profile/components/ProfilePage";

export default function ProfileRoutePage() {
  return (
    <PrivateRoute>
      <ProfilePage />
    </PrivateRoute>
  );
}
