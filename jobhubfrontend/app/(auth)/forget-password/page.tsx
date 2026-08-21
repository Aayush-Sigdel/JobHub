"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { AuthCharacters, AuthFieldType } from "@/components/auth/auth-characters";

const BrandMark = () => (
  <svg
    className="w-8 h-8 text-neutral-900"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
  </svg>
);

export default function ForgetPasswordPage() {
  const [email, setEmail] = useState("");
  const [focusedField, setFocusedField] = useState<AuthFieldType>("none");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!email || !email.includes("@")) {
      setAuthError("Please enter a valid registered email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 800));
      setIsSubmitted(true);
    } catch {
      setAuthError("Failed to send reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-white selection:bg-neutral-900 selection:text-white">
      {/* Left Column: Generous character stage (Edge-to-Edge) */}
      <div className="w-full md:w-[52%] lg:w-[55%] xl:w-[58%] bg-[#ECECEE] min-h-[480px] md:min-h-screen flex flex-col justify-between pt-20 sm:pt-24 px-6 sm:px-10 lg:px-12 pb-0 relative overflow-hidden">
        <div className="relative w-full flex-1 flex flex-col justify-end items-center pb-0">
          <AuthCharacters
            focusedField={focusedField}
            isSubmitting={isSubmitting}
            isHoveringSubmit={isHoveringSubmit}
            emailValue={email}
            errorMessage={authError}
            pageType="forget"
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
            {!isSubmitted ? (
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
                    Reset Password
                  </h1>
                  <p className="text-base text-neutral-500 font-medium">
                    Enter your email to receive instructions
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="reset-email"
                      className="block text-sm font-bold text-neutral-800 uppercase tracking-wide"
                    >
                      Email address
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onFocus={() => {
                        setFocusedField("email");
                        if (authError) setAuthError("");
                      }}
                      onBlur={() => setFocusedField("none")}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (authError) setAuthError("");
                      }}
                      className={`w-full h-13 px-4 rounded-2xl bg-neutral-50 border-2 ${
                        authError ? "border-rose-400 bg-rose-50/20" : "border-neutral-200"
                      } text-neutral-900 text-base font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-neutral-900/10 focus:border-neutral-900 focus:bg-white transition-all`}
                    />
                    {authError && (
                      <p className="text-xs font-semibold text-rose-500 mt-1 pl-1">
                        {authError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onMouseEnter={() => setIsHoveringSubmit(true)}
                    onMouseLeave={() => setIsHoveringSubmit(false)}
                    className="w-full h-13 sm:h-14 bg-[#18181B] hover:bg-neutral-800 active:scale-[0.99] text-white rounded-full font-bold text-base sm:text-lg transition-all duration-150 flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending reset link...</span>
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>

                  <div className="text-center pt-2 text-sm text-neutral-500 font-medium">
                    Remember your password?{" "}
                    <Link
                      href="/sign-in"
                      className="font-bold text-neutral-900 hover:underline transition-colors ml-1"
                    >
                      Log In
                    </Link>
                  </div>
                </form>
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
                <div className="w-18 h-18 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-5 border-2 border-orange-100 shadow-sm">
                  <Mail className="w-9 h-9" />
                </div>
                <h2 className="text-3xl font-black text-neutral-900 mb-2 tracking-tight">
                  Check your inbox
                </h2>
                <p className="text-neutral-500 text-base font-medium leading-relaxed mb-7">
                  We've sent password reset instructions to{" "}
                  <span className="font-bold text-neutral-900">{email}</span>
                </p>
                <Link href="/sign-in" className="w-full">
                  <button
                    type="button"
                    className="w-full h-13 sm:h-14 bg-[#18181B] hover:bg-neutral-800 text-white rounded-full font-bold text-base transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-md"
                  >
                    Back to Sign In
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
