"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import { toast } from "react-hot-toast";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import SocialMedia from "@/assets/social-media.jpg";
import { useLogin } from "../hooks/useLogin";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await loginMutation.mutateAsync(formData);
      if (result.data.session) {
        toast.success("Login successful!");
        router.push("/");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Login failed. Please try again.";
      toast.error(message);
    }
  };

  return (
    <div
      className={cn(
        `flex flex-col gap-6 items-center justify-center min-h-screen ${poppins.className}`,
      )}
    >
      <Card className="overflow-hidden p-0 mx-auto w-full max-w-4xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            className="p-6 md:p-8 flex items-center justify-center w-full"
          >
            <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your LinkedPost account
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  disabled={loginMutation.isPending}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter Your Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    disabled={loginMutation.isPending}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-2 flex items-center px-2 text-sm text-muted-foreground"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <Image
              height={500}
              width={500}
              src={SocialMedia}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
