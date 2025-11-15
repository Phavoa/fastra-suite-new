"use client";

import React, { useState, useRef, useEffect } from "react";
import type { NextPage } from "next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VerifyOTPPage: NextPage = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const digits = paste.replace(/\D/g, "").slice(0, 4).split("");
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < 4) newOtp[i] = digit;
    });
    setOtp(newOtp);
    digits.forEach((digit, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i]!.value = digit;
      }
    });
    if (digits.length === 4) {
      inputsRef.current[3]?.focus();
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    // Mock verification
    setTimeout(() => {
      const code = otp.join("");
      if (code === "1234") {
        setSuccess(true);
      } else {
        setError("Invalid verification code. Please try again.");
      }
      setLoading(false);
    }, 1000);
  };

  const handleResend = () => {
    // Mock resend
    console.log("Resend code");
  };

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center">
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:px-20">
          <div className="max-w-md w-full text-center">
            <div className="rounded-md border border-green-100 bg-green-50 p-4 text-sm text-green-800">
              Email verified successfully! You can now proceed.
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center">
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:px-20">
        <div className="max-w-[440px] w-full flex flex-col justify-center items-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Verify your email
          </h1>
          <p className="text-base text-gray-600 mb-8 text-center">
            {"We've"} sent a verification code to{" "}
            <span className="font-medium text-gray-800">user@example.com</span>.
            Enter the code below to verify your account.
          </p>

          <div className="flex justify-center gap-2 md:gap-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className={cn(
                  "w-16 h-16 text-2xl md:w-[76px] md:h-[76px] md:text-[30px] lg:w-[78px] lg:h-[78px] lg:text-[32px] font-normal text-center border-2 border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all",
                  error &&
                    "border-red-500 focus:border-red-500 focus:ring-red-100"
                )}
                aria-label={`OTP digit ${index + 1} of 4`}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-4 text-center">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={otp.some((d) => !d) || loading}
            className={cn(
              "w-full max-w-[400px] mx-auto h-12 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg"
            )}
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>

          <p className="mt-6 text-sm text-gray-600 text-center">
            {"Didn't"} receive the code?{" "}
            <button
              onClick={handleResend}
              className="text-blue-500 hover:underline"
            >
              Resend
            </button>
          </p>
        </div>
      </div>
    </main>
  );
};

export default VerifyOTPPage;
