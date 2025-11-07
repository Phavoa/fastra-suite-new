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
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // optional helper for classNames if you have it; otherwise remove and use plain strings
import Image from "next/image";

// -- Zod schema for form validation
const formSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyEmail: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof formSchema>;

// -- Mock submit handler (simulates network)
const fakeSubmit = (payload: FormData) =>
  new Promise<{ ok: boolean; id?: string }>((resolve) =>
    setTimeout(() => resolve({ ok: true, id: "company_abc_123" }), 900)
  );

// -- Left hero component
const LeftHero: React.FC = () => {
  return (
    <div
      className="flex-1 min-h-screen relative flex flex-col p-6 md:p-12 lg:px-20"
      style={{
        backgroundImage:
          "radial-gradient(circle at 12px 12px, rgba(0,0,0,0.02) 1px, transparent 1px)",
      }}
      aria-hidden="true"
    >
      <div className="">
        {/* Brand */}
        <div className="flex items-center gap-3 w-32 h-12 mb-16">
          {/* stylized mark */}
          <Image
            src="/images/fastra-logo.png"
            alt="Fastra"
            width={1000}
            height={1000}
            className="object-fill w-full h-auto"
          />
        </div>

        {/* Hero heading */}
        <h1
          className="font-[Inter] text-3xl md:text-4xl lg:text-5xl leading-tight font-bold text-gray-900 mb-3"
          style={{ lineHeight: 1.12 }}
        >
          Maximize the Planning of Projects with
          <span className="text-transparent bg-clip-text bg-linear-to-r from-[#3B7CED] to-[#4169E1]">
            <span className="text-transparent"> Fastra Suite</span>
          </span>
        </h1>

        <p className="text-sm md:text-lg text-gray-600 max-w-md mb-6">
          Scale Without Limits: Automate, Integrate, and Secure Your Project
          Operations
        </p>

        <div className="mb-8">
          <Button
            variant="default"
            className="cursor-pointer transition-shadow"
          >
            Contact Us
          </Button>
        </div>

        {/* Simulated product table / dashboard small card */}
        <Card className="max-w-[720px] shadow-sm border border-gray-100">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-700">Purchase</div>
              <div className="text-xs text-gray-400">Home / Purchase</div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center py-2 border-y border-gray-100">
              <div>
                <div className="text-xs text-gray-400">Draft</div>
                <div className="text-lg font-semibold text-sky-600">12</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Approved</div>
                <div className="text-lg font-semibold text-green-500">12</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Pending</div>
                <div className="text-lg font-semibold text-yellow-500">12</div>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-500">
              <table className="w-full text-left text-[13px]">
                <thead className="text-gray-600">
                  <tr>
                    <th className="py-2">Request ID</th>
                    <th className="py-2">Product Name</th>
                    <th className="py-2">QTY</th>
                    <th className="py-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <tr
                      key={i}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-2">PR000{i + 1}</td>
                      <td className="py-2">Laptop, Keyboard & Mouse</td>
                      <td className="py-2">4</td>
                      <td className="py-2">2,600,000</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// -- Right registration form component
const RightForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setLoading(true);
    try {
      const res = await fakeSubmit(data);
      if (res.ok) {
        setSubmittedId(res.id || "ok");
      } else {
        setError("Failed to register. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 border flex items-center justify-center p-6 md:p-12 lg:px-20 bg-white">
      <div className="max-w-md w-full">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
          Register
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Enter your details to register
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          aria-describedby="form-help"
        >
          <div>
            <Label
              htmlFor="companyName"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Company name
            </Label>
            <Input
              id="companyName"
              {...register("companyName")}
              placeholder="Enter your company name"
              aria-required
              aria-label="Company name"
              className="h-12 rounded-md border-gray-300 placeholder:text-gray-400 focus:border-[#4169E1] focus:ring-4 focus:ring-[rgba(65,105,225,0.08)]"
            />
            {errors.companyName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="companyEmail"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Company email
            </Label>
            <Input
              id="companyEmail"
              type="email"
              {...register("companyEmail")}
              placeholder="Enter your company email"
              aria-required
              aria-label="Company email"
              className="h-12 rounded-md border-gray-300 placeholder:text-gray-400 focus:border-[#4169E1] focus:ring-4 focus:ring-[rgba(65,105,225,0.08)]"
            />
            {errors.companyEmail && (
              <p className="text-sm text-red-600 mt-1">
                {errors.companyEmail.message}
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
                  !isValid || loading
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:shadow-md"
                )}
                disabled={!isValid || loading}
                aria-disabled={!isValid || loading}
              >
                {loading ? "Processing..." : "Continue"}
              </Button>

              <div className="text-center mt-6">
                <a href="#" className="text-sky-600 hover:underline text-sm">
                  Already have an account?
                </a>
              </div>
            </>
          ) : (
            <div className="rounded-md border border-green-100 bg-green-50 p-4 text-sm text-green-800">
              Account created successfully. Reference:{" "}
              <strong>{submittedId}</strong>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

// -- Main Page
const RegisterPage: NextPage = () => {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex flex-1">
        <LeftHero />
        <RightForm />
      </div>
    </main>
  );
};

export default RegisterPage;
