"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import vapLogo from "@/assets/vap-logo.jpeg";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [organizationId, setOrganizationId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgDisplayid: organizationId,
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        toast.error(data.error || "Login failed");
        return;
      }

      if (data.success) {
        // Store the token in localStorage or cookies
        if (data.token?.access_token) {
          localStorage.setItem("access_token", data.token.access_token);
          localStorage.setItem("refresh_token", data.token.refresh_token);
          localStorage.setItem("user_profile", JSON.stringify(data.profile));
        }

        toast.success("Login successful!");

        await supabase.auth.setSession({
          access_token: data.token.access_token,
          refresh_token: data.token.refresh_token,
        });

        if (data.profile.role === "admin") {
          router.push("/panels/admin");
        } else if (data.profile.role === "user") {
          router.push("/panels/features");
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <Button
        variant="ghost"
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 text-foreground/80 hover:text-foreground"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Home
      </Button>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Image
              src={vapLogo}
              alt="VAP Logo"
              className="h-16 w-auto rounded-md"
            />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-base mt-2">
              Sign in to your account to continue
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="organizationId" className="text-sm font-medium">
                Organization ID
              </Label>
              <Input
                id="organizationId"
                type="text"
                placeholder="Enter your organization ID"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <a
                href="#"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-glow hover:shadow-glow-lg transition-all duration-300 font-semibold text-base"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
