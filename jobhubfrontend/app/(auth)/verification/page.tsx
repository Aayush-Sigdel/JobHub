"use client";

import React, { useState, useRef, Suspense } from "react";
import Link from "next/link";
import JobHubLogo from "@/components/brand/JobHubLogo";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { AuthCharacters } from "@/components/auth/auth-characters";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


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
    } catch (error) {
      setAuthError("Failed to connect to verification server.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <main className="min-h-dvh w-full flex flex-col md:flex-row bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Left Column: Generous character stage */}
      <div className="w-full md:w-[52%] lg:w-[55%] xl:w-[58%] bg-muted border-b border-border md:border-b-0 md:border-r min-h-[480px] md:min-h-dvh flex flex-col justify-between pt-20 sm:pt-24 px-6 sm:px-10 lg:px-12 pb-0 relative overflow-hidden">
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
      <div className="w-full md:w-[48%] lg:w-[45%] xl:w-[42%] min-h-[calc(100dvh-480px)] md:min-h-dvh bg-card flex flex-col justify-center items-center pt-24 pb-12 px-6 sm:px-12 lg:px-16 xl:px-20 text-foreground">
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
                  <JobHubLogo markOnly markClassName="size-11" />
                </div>

                <div className="text-center mb-8">
                  <h1 className="text-3xl sm:text-4xl lg:text-4xl font-semibold tracking-tight text-foreground mb-2">
                    Verify Email
                  </h1>
                  <p className="text-base text-muted-foreground font-medium leading-relaxed">
                    We sent a 6-digit verification code to{" "}
                    <span className="font-medium text-foreground">
                      {email || "your email"}
                    </span>
                  </p>
                </div>

                <div className="flex justify-center gap-1.5 sm:gap-2.5 mb-9">
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
                      className="min-w-0 w-full max-w-12 flex-1 h-12 sm:max-w-13 sm:h-14 text-center text-2xl font-semibold text-foreground bg-background border border-border rounded-xl focus:border-foreground/40 focus:ring-3 focus:ring-ring/30 outline-none transition-all"
                    />
                  ))}
                </div>

                {authError && (
                  <p className="text-xs font-semibold text-destructive text-center mb-4">
                    {authError}
                  </p>
                )}

                <button
                  type="button"
                  disabled={!isComplete || isSubmitting}
                  onClick={handleVerify}
                  className="w-full h-12 sm:h-12 bg-primary hover:bg-primary/85 active:scale-[0.99] text-primary-foreground rounded-xl font-medium text-base sm:text-base transition-all duration-150 flex items-center justify-center gap-2.5 shadow-none hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

                <div className="mt-7 text-center text-sm font-medium text-muted-foreground">
                  Didn&apos;t receive the code?{" "}
                  <button
                    type="button"
                    onClick={() =>
                      setAuthError(
                        "Code resent! Please check your spam folder too.",
                      )
                    }
                    className="text-foreground font-medium hover:underline transition-colors ml-1 cursor-pointer"
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
                <div className="w-18 h-18 bg-success/10 text-success rounded-full flex items-center justify-center mb-5 border border-success/20 shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h2 className="text-3xl font-semibold text-foreground mb-2 tracking-tight">
                  Email Verified!
                </h2>
                <p className="text-muted-foreground text-base font-medium leading-relaxed mb-7">
                  Your email has been verified! Sign in to complete your profile setup.
                </p>
                <Link
                  href={`/sign-in?email=${encodeURIComponent(email)}`}
                  className="w-full"
                >
                  <button
                    type="button"
                    className="w-full h-12 sm:h-12 bg-primary hover:bg-primary/85 text-primary-foreground rounded-xl font-medium text-base transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-none"
                  >
                    <span>Sign In to Continue</span>
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
        <div className="min-h-dvh w-full bg-card flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-foreground" />
        </div>
      }
    >
      <VerificationForm />
    </Suspense>
  );
}
