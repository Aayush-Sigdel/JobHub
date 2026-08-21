"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { AuthCharacters, AuthFieldType } from "@/components/auth/auth-characters";

const totalSteps = 5;

const hiringOptions = [
  { id: "1-10", label: "1 – 10 roles" },
  { id: "10-50", label: "10 – 50 roles" },
  { id: "50-200", label: "50 – 200 roles" },
  { id: "200+", label: "200+ roles" },
];

export default function EnterprisePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [hiringVolume, setHiringVolume] = useState("10-50");
  const [notes, setNotes] = useState("");

  const [focusedField, setFocusedField] = useState<AuthFieldType>("none");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleNext = () => {
    setAuthError("");
    if (currentStep === 1) {
      if (!companyName.trim()) {
        setAuthError("Please enter your company or team name.");
        return;
      }
    } else if (currentStep === 2) {
      if (!fullName.trim()) {
        setAuthError("Please enter your full name.");
        return;
      }
    } else if (currentStep === 3) {
      if (!workEmail.trim() || !workEmail.includes("@")) {
        setAuthError("Please enter a valid work email address.");
        return;
      }
    } else if (currentStep === 4) {
      if (!hiringVolume) {
        setAuthError("Please choose an expected hiring scale.");
        return;
      }
    }

    if (currentStep < totalSteps) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setAuthError("");
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && currentStep !== 5) {
      e.preventDefault();
      handleNext();
    }
  };

  const handleSubmit = async () => {
    setAuthError("");
    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 800));
      setIsSubmitted(true);
    } catch {
      setAuthError("Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 24 : -24,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -24 : 24,
      opacity: 0,
    }),
  };

  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-white selection:bg-neutral-900 selection:text-white">
      {/* Left Column: Minimal character stage */}
      <div className="w-full md:w-[50%] lg:w-[54%] bg-[#ECECEE] min-h-[440px] md:min-h-screen flex flex-col justify-between pt-20 sm:pt-24 px-6 sm:px-10 lg:px-12 pb-0 relative overflow-hidden">
        <div className="relative w-full flex-1 flex flex-col justify-end items-center pb-0">
          <AuthCharacters
            focusedField={focusedField}
            isSubmitting={isSubmitting}
            isHoveringSubmit={isHoveringSubmit}
            nameValue={fullName}
            emailValue={workEmail}
            errorMessage={authError}
            pageType="enterprise"
            enterpriseStep={currentStep}
            className="w-full max-w-[560px] lg:max-w-[640px] xl:max-w-[700px]"
          />
        </div>
      </div>

      {/* Right Column: Clean, Minimalist Executive Flow */}
      <div className="w-full md:w-[50%] lg:w-[46%] min-h-[calc(100vh-440px)] md:min-h-screen bg-white flex flex-col justify-center items-center pt-24 pb-12 px-6 sm:px-12 lg:px-16 xl:px-20 text-neutral-900 overflow-y-auto">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <div className="space-y-7">
                {/* Minimal Step Indicator */}
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  <span>Step 0{currentStep} / 0{totalSteps}</span>
                  <div className="w-16 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-900 transition-all duration-300 rounded-full"
                      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Animated Minimal Question Step */}
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    onKeyDown={handleKeyDown}
                    className="min-h-[220px] flex flex-col justify-center space-y-5"
                  >
                    {/* STEP 1: Company */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-1.5">
                            What is your company name?
                          </h1>
                          <p className="text-sm text-neutral-500 font-medium">
                            We'll customize your candidate pipelines accordingly.
                          </p>
                        </div>

                        <input
                          type="text"
                          autoFocus
                          placeholder="e.g. Acme Corp"
                          value={companyName}
                          onFocus={() => {
                            setFocusedField("name");
                            if (authError) setAuthError("");
                          }}
                          onBlur={() => setFocusedField("none")}
                          onChange={(e) => {
                            setCompanyName(e.target.value);
                            if (authError) setAuthError("");
                          }}
                          className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-base font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 focus:bg-white transition-all"
                        />
                      </div>
                    )}

                    {/* STEP 2: Name & Role */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-1.5">
                            What is your name and role?
                          </h1>
                          <p className="text-sm text-neutral-500 font-medium">
                            Who will be our primary point of contact?
                          </p>
                        </div>

                        <div className="space-y-3">
                          <input
                            type="text"
                            autoFocus
                            placeholder="Full name"
                            value={fullName}
                            onFocus={() => {
                              setFocusedField("name");
                              if (authError) setAuthError("");
                            }}
                            onBlur={() => setFocusedField("none")}
                            onChange={(e) => {
                              setFullName(e.target.value);
                              if (authError) setAuthError("");
                            }}
                            className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-base font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 focus:bg-white transition-all"
                          />
                          <input
                            type="text"
                            placeholder="Your title (e.g. VP of Engineering)"
                            value={jobTitle}
                            onChange={(e) => {
                              setJobTitle(e.target.value);
                              if (authError) setAuthError("");
                            }}
                            className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-base font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Work Email */}
                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-1.5">
                            What is your work email?
                          </h1>
                          <p className="text-sm text-neutral-500 font-medium">
                            We'll send the quote and calendar link here.
                          </p>
                        </div>

                        <input
                          type="email"
                          autoFocus
                          placeholder="name@company.com"
                          value={workEmail}
                          onFocus={() => {
                            setFocusedField("email");
                            if (authError) setAuthError("");
                          }}
                          onBlur={() => setFocusedField("none")}
                          onChange={(e) => {
                            setWorkEmail(e.target.value);
                            if (authError) setAuthError("");
                          }}
                          className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-base font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 focus:bg-white transition-all"
                        />
                      </div>
                    )}

                    {/* STEP 4: Hiring Volume */}
                    {currentStep === 4 && (
                      <div className="space-y-4">
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-1.5">
                            Expected hiring volume?
                          </h1>
                          <p className="text-sm text-neutral-500 font-medium">
                            Approximate hires over the next 12 months.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {hiringOptions.map((opt) => {
                            const isSelected = hiringVolume === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  setHiringVolume(opt.id);
                                  if (authError) setAuthError("");
                                }}
                                className={`h-11 px-3.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                                  isSelected
                                    ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                                    : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300"
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* STEP 5: Requirements */}
                    {currentStep === 5 && (
                      <div className="space-y-4">
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-1.5">
                            Any specific requirements?
                          </h1>
                          <p className="text-sm text-neutral-500 font-medium">
                            Share any priority roles, stack, or ATS needs.
                          </p>
                        </div>

                        <textarea
                          rows={3}
                          autoFocus
                          placeholder="e.g. Senior Frontend, Staff Backend, Greenhouse ATS..."
                          value={notes}
                          onChange={(e) => {
                            setNotes(e.target.value);
                            if (authError) setAuthError("");
                          }}
                          className="w-full p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm font-medium placeholder:text-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 focus:bg-white transition-all"
                        />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Bottom Navigation */}
                <div className="pt-2 flex items-center justify-between">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                    onMouseEnter={() => setIsHoveringSubmit(true)}
                    onMouseLeave={() => setIsHoveringSubmit(false)}
                    className="inline-flex items-center gap-2 px-6 h-11 rounded-full text-xs sm:text-sm font-bold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : currentStep === totalSteps ? (
                      <>
                        <span>Submit Request</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Success Screen */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="text-center py-6 space-y-4"
              >
                <div className="w-14 h-14 bg-neutral-100 text-neutral-900 rounded-full flex items-center justify-center mx-auto border border-neutral-200">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight mb-1">
                    Request Received
                  </h2>
                  <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                    Thank you, {fullName}. Our enterprise team will reach out to <span className="font-bold text-neutral-900">{workEmail}</span> within 24 hours.
                  </p>
                </div>

                <div className="pt-2">
                  <Link href="/">
                    <button
                      type="button"
                      className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      Return to Home
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
