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
    <main className="min-h-dvh w-full flex flex-col md:flex-row bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Left Column: Minimal character stage */}
      <div className="w-full md:w-[50%] lg:w-[54%] bg-muted border-b border-border md:border-b-0 md:border-r min-h-[440px] md:min-h-dvh flex flex-col justify-between pt-20 sm:pt-24 px-6 sm:px-10 lg:px-12 pb-0 relative overflow-hidden">
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
      <div className="w-full md:w-[50%] lg:w-[46%] min-h-[calc(100dvh-440px)] md:min-h-dvh bg-card flex flex-col justify-center items-center pt-24 pb-12 px-6 sm:px-12 lg:px-16 xl:px-20 text-foreground overflow-y-auto">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <div className="space-y-7">
                {/* Minimal Step Indicator */}
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground r">
                  <span>Step 0{currentStep} / 0{totalSteps}</span>
                  <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 rounded-full"
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
                          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-1.5">
                            What is your company name?
                          </h1>
                          <p className="text-sm text-muted-foreground font-medium">
                            We&apos;ll customize your candidate pipelines accordingly.
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
                          className="w-full h-12 px-4 rounded-xl bg-background border border-border text-foreground text-base font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-foreground/40 focus:bg-card transition-all"
                        />
                      </div>
                    )}

                    {/* STEP 2: Name & Role */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-1.5">
                            What is your name and role?
                          </h1>
                          <p className="text-sm text-muted-foreground font-medium">
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
                            className="w-full h-12 px-4 rounded-xl bg-background border border-border text-foreground text-base font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-foreground/40 focus:bg-card transition-all"
                          />
                          <input
                            type="text"
                            placeholder="Your title (e.g. VP of Engineering)"
                            value={jobTitle}
                            onChange={(e) => {
                              setJobTitle(e.target.value);
                              if (authError) setAuthError("");
                            }}
                            className="w-full h-12 px-4 rounded-xl bg-background border border-border text-foreground text-base font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-foreground/40 focus:bg-card transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Work Email */}
                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-1.5">
                            What is your work email?
                          </h1>
                          <p className="text-sm text-muted-foreground font-medium">
                            We&apos;ll send the quote and calendar link here.
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
                          className="w-full h-12 px-4 rounded-xl bg-background border border-border text-foreground text-base font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-foreground/40 focus:bg-card transition-all"
                        />
                      </div>
                    )}

                    {/* STEP 4: Hiring Volume */}
                    {currentStep === 4 && (
                      <div className="space-y-4">
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-1.5">
                            Expected hiring volume?
                          </h1>
                          <p className="text-sm text-muted-foreground font-medium">
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
                                className={`h-11 px-3.5 rounded-xl text-xs font-medium border transition-all cursor-pointer text-center ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                    : "bg-background text-foreground border-border hover:border-foreground/25"
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
                          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-1.5">
                            Any specific requirements?
                          </h1>
                          <p className="text-sm text-muted-foreground font-medium">
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
                          className="w-full p-3.5 rounded-xl bg-background border border-border text-foreground text-sm font-medium placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-foreground/40 focus:bg-card transition-all"
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
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
                    className="inline-flex items-center gap-2 px-6 h-11 rounded-xl text-xs sm:text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/85 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
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
                <div className="w-14 h-14 bg-muted text-foreground rounded-full flex items-center justify-center mx-auto border border-border">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-1">
                    Request Received
                  </h2>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Thank you, {fullName}. Our enterprise team will reach out to <span className="font-medium text-foreground">{workEmail}</span> within 24 hours.
                  </p>
                </div>

                <div className="pt-2">
                  <Link href="/">
                    <button
                      type="button"
                      className="w-full h-11 bg-primary hover:bg-primary/85 text-primary-foreground rounded-xl font-medium text-xs sm:text-sm transition-colors cursor-pointer"
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
