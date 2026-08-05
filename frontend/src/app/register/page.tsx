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
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters"),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
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
      const res = await api.register(values.email, values.full_name, values.password);
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
      title="Create your account"
      subtitle="Start scoring transactions in under a minute."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" placeholder="Jane Analyst" {...register("full_name")} />
          <ErrorText>{errors.full_name?.message}</ErrorText>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
          <ErrorText>{errors.email?.message}</ErrorText>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="At least 8 characters" {...register("password")} />
          <ErrorText>{errors.password?.message}</ErrorText>
        </div>
        {serverError && <ErrorText>{serverError}</ErrorText>}
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[color:var(--color-text-secondary)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[color:var(--color-signal-safe)] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
