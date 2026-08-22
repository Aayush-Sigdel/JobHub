"use client";

import React, { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { AuthCharacters } from "@/components/auth/auth-characters";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const BrandMark = () => (
  <svg
    className="w-8 h-8 text-neutral-900"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
  </svg>
);

function VerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const name = searchParams.get("name") || "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [authError, setAuthError] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (authError) setAuthError("");

    if (value.length > 1) {
      const pastedDigits = value.slice(0, 6).split("");
      const newCode = [...code];
      pastedDigits.forEach((digit, i) => {
        if (i < 6) newCode[i] = digit;
      });
      setCode(newCode);
      const nextIndex = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isComplete = code.every((digit) => digit !== "");

  const handleVerify = async () => {
    if (!isComplete) return;
    setAuthError("");
    setIsSubmitting(true);

    const otpCode = code.join("");

    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: otpCode,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setAuthError(err.message || "Invalid or expired 6-digit code.");
        return;
      }

      setIsVerified(true);
      setTimeout(() => {
        router.push(
          "/onboarding?email=" +
            encodeURIComponent(email) +
            "&name=" +
            encodeURIComponent(name),
        );
      }, 2000);
    } catch (error) {
      setAuthError("Failed to connect to verification server.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-white selection:bg-neutral-900 selection:text-white">
      {/* Left Column: Generous character stage */}
      <div className="w-full md:w-[52%] lg:w-[55%] xl:w-[58%] bg-[#ECECEE] min-h-[480px] md:min-h-screen flex flex-col justify-between pt-20 sm:pt-24 px-6 sm:px-10 lg:px-12 pb-0 relative overflow-hidden">
        <div className="relative w-full flex-1 flex flex-col justify-end items-center pb-0">
          <AuthCharacters
            focusedField="none"
            isSubmitting={isSubmitting}
            errorMessage={authError}
            pageType="verify"
            className="w-full max-w-[580px] lg:max-w-[680px] xl:max-w-[760px]"
          />
        </div>
      </div>

      {/* Right Column: Full-height form */}
      <div className="w-full md:w-[48%] lg:w-[45%] xl:w-[42%] min-h-[calc(100vh-480px)] md:min-h-screen bg-white flex flex-col justify-center items-center pt-24 pb-12 px-6 sm:px-12 lg:px-16 xl:px-20 text-neutral-900">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <AnimatePresence mode="wait">
            {!isVerified ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <div className="flex justify-center mb-6">
                  <BrandMark />
                </div>

                <div className="text-center mb-8">
                  <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-neutral-900 mb-2">
                    Verify Email
                  </h1>
                  <p className="text-base text-neutral-500 font-medium leading-relaxed">
                    We sent a 6-digit verification code to{" "}
                    <span className="font-bold text-neutral-900">
                      {email || "your email"}
                    </span>
                  </p>
                </div>

                <div className="flex justify-center gap-2.5 mb-9">
                  {code.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-14 sm:w-13 sm:h-16 text-center text-2xl font-black text-neutral-900 bg-neutral-50 border-2 border-neutral-200 rounded-2xl focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/10 outline-none transition-all"
                    />
                  ))}
                </div>

                {authError && (
                  <p className="text-xs font-semibold text-rose-500 text-center mb-4">
                    {authError}
                  </p>
                )}

                <button
                  type="button"
                  disabled={!isComplete || isSubmitting}
                  onClick={handleVerify}
                  className="w-full h-13 sm:h-14 bg-[#18181B] hover:bg-neutral-800 active:scale-[0.99] text-white rounded-full font-bold text-base sm:text-lg transition-all duration-150 flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying code...</span>
                    </>
                  ) : (
                    "Verify Account"
                  )}
                </button>

                <div className="mt-7 text-center text-sm font-medium text-neutral-500">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    onClick={() =>
                      setAuthError(
                        "Code resent! Please check your spam folder too 📬",
                      )
                    }
                    className="text-neutral-900 font-bold hover:underline transition-colors ml-1 cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center text-center py-2"
              >
                <div className="w-18 h-18 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-5 border-2 border-emerald-100 shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h2 className="text-3xl font-black text-neutral-900 mb-2 tracking-tight">
                  Email Verified!
                </h2>
                <p className="text-neutral-500 text-base font-medium leading-relaxed mb-7">
                  Your email has been confirmed. Let's finish setting up your
                  candidate profile!
                </p>
                <Link
                  href={`/onboarding?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`}
                  className="w-full"
                >
                  <button
                    type="button"
                    className="w-full h-13 sm:h-14 bg-[#18181B] hover:bg-neutral-800 text-white rounded-full font-bold text-base transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-md"
                  >
                    <span>Complete Profile Setup</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}

export default function VerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-800" />
        </div>
      }
    >
      <VerificationForm />
    </Suspense>
  );
}
