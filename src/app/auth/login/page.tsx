"use client";

// src/app/register/page.tsx
import React, { useState } from "react";
import type { NextPage } from "next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLoginMutation } from "@/api/authApi";
import { useDispatch } from "react-redux";
import { setAuthData } from "@/lib/store/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof formSchema>;

// -- Mock submit handler (simulates network)
const fakeSubmit = (_payload: FormData) =>
  new Promise<{ ok: boolean; id?: string }>((resolve) =>
    setTimeout(() => resolve({ ok: true, id: "company_abc_123" }), 900),
  );

const LoginPage: NextPage = () => {
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const result = await login(data).unwrap();
      console.log(result);
      dispatch(
        setAuthData({
          user: result.user,
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          tenant_id: result.tenant_id,
          tenant_schema_name: result.tenant_schema_name,
          tenant_company_name: result.tenant_company_name,
          isOnboarded: result.isOnboarded,
          user_accesses: result.user_accesses,
        }),
      );

      // Set httpOnly cookie via API route for security
      await fetch("/api/auth/set-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        }),
      });

      setSubmittedId(result.user.username || "success");
      router.push("/");
    } catch (err) {
      const error = err as { data?: { detail?: string } };
      setError(error?.data?.detail || "Failed to login. Please try again.");
    }
  };
  return (
    <main className="min-h-screen bg-gray-50 flex items-center">
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:px-20">
        <div className="max-w-md w-full">
          <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">
            Login
          </h2>
          <p className="text-sm text-gray-500 mb-6 text-center">
            Enter your login details below
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            aria-describedby="form-help"
          >
            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter your email"
                aria-required
                aria-label="Email"
                className="h-12 rounded-md border-gray-300 placeholder:text-gray-400 focus:border-[#4169E1] focus:ring-4 focus:ring-[rgba(65,105,225,0.08)]"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Enter your password"
                aria-required
                aria-label="Password"
                className="h-12 rounded-md border-gray-300 placeholder:text-gray-400 focus:border-[#4169E1] focus:ring-4 focus:ring-[rgba(65,105,225,0.08)]"
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            {!submittedId ? (
              <>
                <Button
                  type="submit"
                  variant={"default"}
                  className={cn(
                    "w-full py-6 rounded-md text-lg font-medium transition-transform active:scale-[0.995] mt-4",
                    !isValid || isLoggingIn
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:shadow-md",
                  )}
                  disabled={!isValid || isLoggingIn}
                  aria-disabled={!isValid || isLoggingIn}
                >
                  {isLoggingIn ? "Logging in..." : "Login"}
                </Button>

                <div className="text-center mt-6">
                  <Link
                    href="/auth/register"
                    className="text-sky-600 hover:underline text-sm"
                  >
                    Don&apos;t have an account?
                  </Link>
                </div>
              </>
            ) : (
              <div className="rounded-md border border-green-100 bg-green-50 p-4 text-sm text-green-800">
                Login successful. Welcome back!
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
