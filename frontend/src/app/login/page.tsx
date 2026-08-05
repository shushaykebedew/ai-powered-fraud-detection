"use client";

import { Button } from "@/components/ui/Button";
import { ErrorText, Input, Label } from "@/components/ui/primitives";
import { AuthShell } from "@/components/layout/AuthShell";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const res = await api.login(values.email, values.password);
      setAuth(res.access_token, res.refresh_token, res.user);
      router.push("/dashboard");
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : "Couldn't reach the server. Try again."
      );
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to keep watching the stream."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
          <ErrorText>{errors.email?.message}</ErrorText>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
          <ErrorText>{errors.password?.message}</ErrorText>
        </div>
        {serverError && <ErrorText>{serverError}</ErrorText>}
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[color:var(--color-text-secondary)]">
        New here?{" "}
        <Link href="/register" className="text-[color:var(--color-signal-safe)] hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
