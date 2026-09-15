"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  X,
  User,
  Globe,
  UploadCloud,
  FileText,
  Trash2,
  Phone,
} from "lucide-react";

import { AuthCharacters, AuthFieldType } from "@/components/auth/auth-characters";
import { Location } from "@/types/user";
import { LocationPopover } from "@/app/(applier)/candidate-profile/_components/location-popover";
import { updateProfileAction, completeOnboardingAction } from "@/lib/actions/user";
import { getSession, useSession } from "next-auth/react";

const GithubIcon = () => (
  <svg className="w-4 h-4 shrink-0 text-foreground" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-4 h-4 shrink-0 text-[#0a66c2]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.2a1.64 1.64 0 0 0-1.64 1.63c0 .91.74 1.64 1.64 1.64.9 0 1.63-.73 1.63-1.64 0-.9-.73-1.63-1.63-1.63Z" />
  </svg>
);

const totalSteps = 4;

const popularSkills = [
  "React",
  "TypeScript",
  "Next.js",
  "Node.js",
  "Tailwind CSS",
  "Python",
  "Figma",
  "SQL",
  "Go",
  "Docker",
  "GraphQL",
  "AWS",
];

const roleLevels = [
  "Entry-level",
  "Mid-level",
  "Senior-level",
  "Lead / Director",
];

const workTypes = ["Remote", "Hybrid", "On-site"];

function OnboardingContent() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const initialName = searchParams.get("name") || "";

  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Step 1: Full Name, Title & Bio
  const [fullName, setFullName] = useState(
    initialName || session?.user?.name || "",
  );
  // const [username, setUsername] = useState(""); // commented out for now
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");

  // Step 2: Role Preferences
  const [preferredRole, setPreferredRole] = useState("");
  const [roleLevel, setRoleLevel] = useState("Mid-level");
  const [workType, setWorkType] = useState("Remote");

  // Step 3: Skills & Location
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [profileLocation, setProfileLocation] = useState<Location | null>({
    city: "Kathmandu",
    country: "Nepal",
  });

  // Step 4: Links & Contact
  const [contactNumber, setContactNumber] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [resumeFile, setResumeFile] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI & Error state
  const [focusedField, setFocusedField] = useState<AuthFieldType>("none");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted] = useState(false);
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
  const [authError, setAuthError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialName) {
      // Session and URL state arrive after the form first renders.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFullName(initialName);
    } else if (session?.user?.name) {
      setFullName(session.user.name);
    }
  }, [initialName, session?.user?.name]);

  const clearError = (field?: string) => {
    if (authError) setAuthError("");
    if (field && fieldErrors[field]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  /*
  const handleUsernameChange = (val: string) => {
    clearError("username");
    const formatted = val.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(formatted);
  };
  */

  const addSkill = (skill: string) => {
    clearError("skills");
    const trimmed = skill.trim();
    if (trimmed && !skills.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      if (skills.length >= 8) {
        setAuthError("You can select up to 8 key skills.");
        return;
      }
      setSkills((previous) => [...previous, trimmed]);
    }
    setCustomSkillInput("");
  };

  const removeSkill = (skill: string) => {
    clearError("skills");
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setAuthError("File size exceeds 5MB limit.");
        return;
      }
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      setResumeFile({ name: file.name, size: sizeStr });
      clearError();
    }
  };

  const handleNext = () => {
    setAuthError("");
    setFieldErrors({});
    const newErrors: { [key: string]: string } = {};

    if (currentStep === 1) {
      if (!fullName.trim() || fullName.trim().length < 2) {
        newErrors.fullName = "Please enter your full name.";
      }
      if (!title.trim()) {
        newErrors.title = "Please provide your professional title.";
      }
      if (!bio.trim() || bio.trim().length < 10) {
        newErrors.bio = "Please provide a short bio (at least 10 characters).";
      }
      if (Object.keys(newErrors).length > 0) {
        setFieldErrors(newErrors);
        setAuthError(newErrors.fullName || newErrors.title || newErrors.bio);
        return;
      }
    } else if (currentStep === 2) {
      if (!preferredRole.trim()) {
        newErrors.preferredRole = "Please enter your preferred role.";
        setFieldErrors(newErrors);
        setAuthError(newErrors.preferredRole);
        return;
      }
    } else if (currentStep === 3) {
      if (skills.length === 0) {
        newErrors.skills = "Please add at least 1 key skill.";
        setFieldErrors(newErrors);
        setAuthError(newErrors.skills);
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
    setFieldErrors({});
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (currentStep === 3 && customSkillInput.trim()) {
        addSkill(customSkillInput);
      } else {
        handleNext();
      }
    }
  };

  const handleSubmit = async () => {
    setAuthError("");
    setIsSubmitting(true);
    try {
      const currentSession = await getSession();
      if (!currentSession?.accessToken) {
        setAuthError("Please sign in to save your profile. Redirecting...");
        setTimeout(() => {
          router.push("/sign-in?callbackUrl=/onboarding");
        }, 1200);
        return;
      }

      const formattedSocialLinks = [];
      if (githubUrl.trim()) {
        formattedSocialLinks.push({ platform: "GITHUB", url: githubUrl.trim() });
      }
      if (linkedinUrl.trim()) {
        formattedSocialLinks.push({ platform: "LINKEDIN", url: linkedinUrl.trim() });
      }
      if (portfolioUrl.trim()) {
        formattedSocialLinks.push({ platform: "PORTFOLIO", url: portfolioUrl.trim() });
      }

      const formattedSkills = skills.map((s) => ({
        name: s,
        level: "INTERMEDIATE",
      }));

      const contactNumbers = contactNumber.trim() ? [contactNumber.trim()] : undefined;

      // 1. Update user profile with real bio and full name from signup
      await updateProfileAction({
        name: fullName.trim() || initialName || session?.user?.name || undefined,
        title: title.trim() || undefined,
        bio: bio.trim() || undefined,
        location: profileLocation ? `${profileLocation.city}, ${profileLocation.country}` : undefined,
        skills: formattedSkills.length > 0 ? formattedSkills : undefined,
        socialLinks: formattedSocialLinks.length > 0 ? formattedSocialLinks : undefined,
        contactNumbers: contactNumbers,
      });

      // 2. Mark onboarding completed in database
      await completeOnboardingAction();

      // 3. Update local session token so middleware allows /home
      if (update) {
        await update({
          onboardingCompleted: true,
          user: {
            onboardingCompleted: true,
          },
        });
      }

      // 4. Directly navigate to appropriate dashboard
      if (currentSession?.user?.employer) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/home";
      }
    } catch (error: unknown) {
      console.error("Failed to complete onboarding:", error);
      const errorMessage = error instanceof Error ? error.message : "";
      const isAuthError =
        errorMessage.includes("401") ||
        errorMessage.includes("403") ||
        errorMessage.includes("Unauthorized");

      if (isAuthError) {
        setAuthError(
          "Your session has expired. Redirecting to sign in...",
        );
        setTimeout(() => {
          router.push("/sign-in?callbackUrl=/onboarding");
        }, 1500);
        return;
      }
      setAuthError("Failed to save profile. Please try again.");
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
      {/* Left Column: Character Stage */}
      <div className="w-full md:w-[50%] lg:w-[54%] bg-muted border-b border-border md:border-b-0 md:border-r min-h-[440px] md:min-h-dvh flex flex-col justify-between pt-20 sm:pt-24 px-6 sm:px-10 lg:px-12 pb-0 relative overflow-hidden">
        <div className="relative w-full flex-1 flex flex-col justify-end items-center pb-0">
          <AuthCharacters
            focusedField={focusedField}
            isSubmitting={isSubmitting}
            isHoveringSubmit={isHoveringSubmit}
            nameValue={fullName || initialName}
            usernameValue=""
            errorMessage={authError}
            pageType="onboarding"
            onboardingStep={currentStep}
            className="w-full max-w-[560px] lg:max-w-[640px] xl:max-w-[700px]"
          />
        </div>
      </div>

      {/* Right Column: Minimalist Essential Onboarding Form */}
      <div className="w-full md:w-[50%] lg:w-[46%] min-h-[calc(100dvh-440px)] md:min-h-dvh bg-card flex flex-col justify-center items-center pt-24 pb-12 px-6 sm:px-12 lg:px-16 xl:px-20 text-foreground overflow-y-auto">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <div className="space-y-7">
                {/* Minimal Step Indicator */}
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground r">
                  <span>Profile Setup • Step 0{currentStep} / 0{totalSteps}</span>
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
                    className="min-h-[260px] flex flex-col justify-center space-y-5"
                  >
                    {/* STEP 1: Handle & Professional Title */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-1.5">
                            Profile Details & Headline
                          </h1>
                          <p className="text-sm text-muted-foreground font-medium">
                            Confirm your name and introduce your professional background.
                          </p>
                        </div>

                        <div className="space-y-3">
                          {/* Full Name from Sign Up */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-medium text-foreground ">
                                Full Name
                              </label>
                              <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded border border-destructive/25">
                                Required
                              </span>
                            </div>
                            <div className="relative flex items-center">
                              <User className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
                              <input
                                type="text"
                                autoFocus
                                required
                                placeholder="Your full name"
                                value={fullName}
                                onFocus={() => {
                                  setFocusedField("name");
                                  clearError("fullName");
                                }}
                                onBlur={() => setFocusedField("none")}
                                onChange={(e) => {
                                  setFullName(e.target.value);
                                  clearError("fullName");
                                }}
                                className={`w-full h-12 pl-10 pr-4 rounded-xl bg-background border ${
                                  fieldErrors.fullName ? "border-destructive bg-destructive/5" : "border-border"
                                } text-foreground text-base font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-foreground/40 focus:bg-card transition-all`}
                              />
                            </div>
                            {fieldErrors.fullName && (
                              <p className="text-xs font-semibold text-destructive pl-1">
                                {fieldErrors.fullName}
                              </p>
                            )}
                          </div>

                          {/* Username handle (commented out for now) */}
                          {/*
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-medium text-foreground ">
                                Username Handle
                              </label>
                              <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded border border-destructive/25">
                                Required
                              </span>
                            </div>
                            <div className="relative flex items-center">
                              <span className="absolute left-4 text-muted-foreground font-medium text-base select-none">
                                @
                              </span>
                              <input
                                type="text"
                                placeholder="username"
                                value={username}
                                onChange={(e) => handleUsernameChange(e.target.value)}
                                className="w-full h-12 pl-9 pr-4 rounded-xl bg-background border border-border"
                              />
                            </div>
                          </div>
                          */}

                          {/* Professional Title */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-medium text-foreground ">
                                Professional Title
                              </label>
                              <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded border border-destructive/25">
                                Required
                              </span>
                            </div>
                            <input
                              type="text"
                              placeholder="e.g. Senior Frontend Engineer"
                              value={title}
                              onFocus={() => {
                                setFocusedField("title");
                                clearError("title");
                              }}
                              onBlur={() => setFocusedField("none")}
                              onChange={(e) => {
                                setTitle(e.target.value);
                                clearError("title");
                              }}
                              className={`w-full h-12 px-4 rounded-xl bg-background border ${
                                fieldErrors.title ? "border-destructive bg-destructive/5" : "border-border"
                              } text-foreground text-base font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-foreground/40 focus:bg-card transition-all`}
                            />
                            {fieldErrors.title && (
                              <p className="text-xs font-semibold text-destructive pl-1">
                                {fieldErrors.title}
                              </p>
                            )}
                          </div>

                          {/* Bio / About Me */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-medium text-foreground ">
                                Bio / About Me
                              </label>
                              <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded border border-destructive/25">
                                Required
                              </span>
                            </div>
                            <textarea
                              rows={3}
                              placeholder="Write a brief professional summary about your background, strengths, and goals..."
                              value={bio}
                              onFocus={() => {
                                setFocusedField("name");
                                clearError("bio");
                              }}
                              onBlur={() => setFocusedField("none")}
                              onChange={(e) => {
                                setBio(e.target.value);
                                clearError("bio");
                              }}
                              className={`w-full p-3 rounded-xl bg-background border ${
                                fieldErrors.bio ? "border-destructive bg-destructive/5" : "border-border"
                              } text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-foreground/40 focus:bg-card transition-all resize-none`}
                            />
                            <div className="flex items-center justify-between pl-1">
                              {fieldErrors.bio ? (
                                <p className="text-xs font-semibold text-destructive">
                                  {fieldErrors.bio}
                                </p>
                              ) : (
                                <p className="text-[11px] text-muted-foreground">
                                  Short summary shown on your public profile
                                </p>
                              )}
                              <span className="text-[11px] text-muted-foreground font-medium">
                                {bio.length}/300
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Role Preferences & Work Mode */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-1.5">
                            Your job preferences
                          </h1>
                          <p className="text-sm text-muted-foreground font-medium">
                            We match you with opportunities based on these.
                          </p>
                        </div>

                        <div className="space-y-3.5">
                          {/* Preferred Role Name */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-medium text-foreground ">
                                Preferred Role
                              </label>
                              <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded border border-destructive/25">
                                Required
                              </span>
                            </div>
                            <input
                              type="text"
                              autoFocus
                              placeholder="e.g. Full Stack Developer"
                              value={preferredRole}
                              onFocus={() => {
                                setFocusedField("name");
                                clearError("preferredRole");
                              }}
                              onBlur={() => setFocusedField("none")}
                              onChange={(e) => {
                                setPreferredRole(e.target.value);
                                clearError("preferredRole");
                              }}
                              className={`w-full h-12 px-4 rounded-xl bg-background border ${
                                fieldErrors.preferredRole ? "border-destructive bg-destructive/5" : "border-border"
                              } text-foreground text-base font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-foreground/40 focus:bg-card transition-all`}
                            />
                            {fieldErrors.preferredRole && (
                              <p className="text-xs font-semibold text-destructive pl-1">
                                {fieldErrors.preferredRole}
                              </p>
                            )}
                          </div>

                          {/* Experience Level */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-medium text-foreground ">
                                Seniority Level
                              </label>
                              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                Optional
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              {roleLevels.map((lvl) => (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => {
                                    setRoleLevel(lvl);
                                    clearError();
                                  }}
                                  className={`h-10 px-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer text-center ${
                                    roleLevel === lvl
                                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                      : "bg-background text-foreground border-border hover:border-foreground/25"
                                  }`}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Work Type */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-medium text-foreground ">
                                Work Style
                              </label>
                              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                Optional
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                              {workTypes.map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => {
                                    setWorkType(type);
                                    clearError();
                                  }}
                                  className={`h-10 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer text-center ${
                                    workType === type
                                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                      : "bg-background text-foreground border-border hover:border-foreground/25"
                                  }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Top Skills & Location Picker */}
                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-1.5">
                            Key skills & location
                          </h1>
                          <p className="text-sm text-muted-foreground font-medium">
                            Highlight your strengths and location for recruiters.
                          </p>
                        </div>

                        <div className="space-y-3.5">
                          {/* Active Selected Skills */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label htmlFor="onboarding-skill" className="block text-xs font-medium text-foreground ">
                                Selected Skills ({skills.length}/8)
                              </label>
                              <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded border border-destructive/25">
                                Min 1 Required
                              </span>
                            </div>
                            <div
                              className={`flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl bg-background border ${
                                fieldErrors.skills ? "border-destructive bg-destructive/5" : "border-border"
                              }`}
                            >
                              {skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
                                >
                                  {skill}
                                  <button
                                    type="button"
                                    onClick={() => removeSkill(skill)}
                                    aria-label={`Remove ${skill}`}
                                    className="hover:text-destructive/80 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                              {skills.length === 0 && (
                                <span className="text-xs text-muted-foreground py-1">
                                  Click tags below or type to add skills
                                </span>
                              )}
                            </div>
                            <div className="flex min-w-0 gap-2">
                              <input
                                id="onboarding-skill"
                                type="text"
                                value={customSkillInput}
                                maxLength={60}
                                autoComplete="off"
                                placeholder="Type a skill, such as Kubernetes"
                                onChange={(event) => {
                                  setCustomSkillInput(event.target.value);
                                  clearError("skills");
                                }}
                                onKeyDown={(event) => {
                                  event.stopPropagation();
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    addSkill(customSkillInput);
                                  }
                                }}
                                className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
                              />
                              <button
                                type="button"
                                disabled={!customSkillInput.trim() || skills.length >= 8}
                                onClick={() => addSkill(customSkillInput)}
                                className="h-10 shrink-0 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                              >
                                Add skill
                              </button>
                            </div>
                            {fieldErrors.skills && (
                              <p className="text-xs font-semibold text-destructive pl-1">
                                {fieldErrors.skills}
                              </p>
                            )}
                          </div>

                          {/* Quick Add Skills */}
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap gap-1.5">
                              {popularSkills
                                .filter((s) => !skills.includes(s))
                                .slice(0, 6)
                                .map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => addSkill(s)}
                                    className="px-2.5 py-1 rounded-lg bg-card hover:bg-muted text-foreground border border-border text-xs font-semibold transition-colors cursor-pointer"
                                  >
                                    + {s}
                                  </button>
                                ))}
                            </div>
                          </div>

                          {/* Location Picker (Reused from candidate profile page) */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-medium text-foreground ">
                                Location
                              </label>
                              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                Optional
                              </span>
                            </div>
                            <div className="p-3 rounded-xl bg-background border border-border flex items-center justify-between">
                              <LocationPopover
                                profileLocation={profileLocation}
                                setProfileLocation={(loc) => {
                                  setProfileLocation(loc);
                                  clearError();
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: Links & Resume Option */}
                    {currentStep === 4 && (
                      <div className="space-y-4">
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-1.5">
                            Links & Resume
                          </h1>
                          <p className="text-sm text-muted-foreground font-medium">
                            Add your portfolio, GitHub, or resume (optional).
                          </p>
                        </div>

                        <div className="space-y-3.5">
                          {/* Phone / Contact Number */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-medium text-foreground ">
                                Contact Phone Number
                              </label>
                              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                Optional
                              </span>
                            </div>
                            <div className="relative flex items-center">
                              <Phone className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
                              <input
                                type="tel"
                                placeholder="+977 98XXXXXXXX"
                                value={contactNumber}
                                onChange={(e) => {
                                  setContactNumber(e.target.value);
                                  clearError();
                                }}
                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-foreground/40 focus:bg-card transition-all"
                              />
                            </div>
                          </div>

                          {/* LinkedIn URL */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-medium text-foreground ">
                                LinkedIn Profile
                              </label>
                              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                Optional
                              </span>
                            </div>
                            <div className="relative flex items-center">
                              <span className="absolute left-3.5 flex items-center">
                                <LinkedinIcon />
                              </span>
                              <input
                                type="url"
                                placeholder="https://linkedin.com/in/username"
                                value={linkedinUrl}
                                onChange={(e) => {
                                  setLinkedinUrl(e.target.value);
                                  clearError();
                                }}
                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-foreground/40 focus:bg-card transition-all"
                              />
                            </div>
                          </div>

                          {/* GitHub URL */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-medium text-foreground ">
                                GitHub Profile
                              </label>
                              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                Optional
                              </span>
                            </div>
                            <div className="relative flex items-center">
                              <span className="absolute left-3.5 flex items-center">
                                <GithubIcon />
                              </span>
                              <input
                                type="url"
                                placeholder="https://github.com/username"
                                value={githubUrl}
                                onChange={(e) => {
                                  setGithubUrl(e.target.value);
                                  clearError();
                                }}
                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-foreground/40 focus:bg-card transition-all"
                              />
                            </div>
                          </div>

                          {/* Portfolio / Website URL */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-medium text-foreground ">
                                Portfolio / Website
                              </label>
                              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                Optional
                              </span>
                            </div>
                            <div className="relative flex items-center">
                              <Globe className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
                              <input
                                type="url"
                                placeholder="https://yourportfolio.com"
                                value={portfolioUrl}
                                onChange={(e) => {
                                  setPortfolioUrl(e.target.value);
                                  clearError();
                                }}
                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-foreground/40 focus:bg-card transition-all"
                              />
                            </div>
                          </div>

                          {/* Resume Upload */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-medium text-foreground ">
                                Upload Resume / CV
                              </label>
                              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                Optional
                              </span>
                            </div>
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileUpload}
                              className="hidden"
                            />

                            {!resumeFile ? (
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-20 rounded-xl border border-dashed border-border hover:border-foreground/40 bg-background hover:bg-muted/70 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group"
                              >
                                <UploadCloud className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                <span className="text-xs font-medium text-foreground">
                                  Click to upload PDF or DOCX
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  Max 5MB file size
                                </span>
                              </button>
                            ) : (
                              <div className="p-3 rounded-xl bg-background border border-border flex items-center justify-between">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-primary/15 text-foreground flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium text-foreground truncate">
                                      {resumeFile.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {resumeFile.size} • Ready
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setResumeFile(null)}
                                  className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
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
                        <span>Saving profile...</span>
                      </>
                    ) : currentStep === totalSteps ? (
                      <>
                        <span>Complete Profile</span>
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
                    Profile Ready!
                  </h2>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Welcome to JobHub, <span className="font-medium text-foreground">{fullName || initialName || "Candidate"}</span>. Your candidate profile is set up to receive matched opportunities.
                  </p>
                </div>

                <div className="pt-3 space-y-2.5">
                  <Link
                    href={session?.user?.employer ? "/preview/me" : "/candidate-profile"}
                    className="block w-full"
                  >
                    <button
                      type="button"
                      className="w-full h-11 bg-primary hover:bg-primary/85 text-primary-foreground rounded-xl font-medium text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <User className="w-4 h-4" />
                      <span>View Full Profile</span>
                    </button>
                  </Link>

                  <Link
                    href={session?.user?.employer ? "/dashboard" : "/home"}
                    className="block w-full"
                  >
                    <button
                      type="button"
                      className="w-full h-11 bg-muted hover:bg-accent text-foreground rounded-xl font-medium text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      Go to Dashboard
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

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh w-full bg-card flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-foreground" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
