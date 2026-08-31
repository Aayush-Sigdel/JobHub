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
import { api } from "@/lib/api";
import { getSession, useSession } from "next-auth/react";

const GithubIcon = () => (
  <svg className="w-4 h-4 shrink-0 text-neutral-700" viewBox="0 0 24 24" fill="currentColor">
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
  const initialEmail = searchParams.get("email") || "";
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
  const [skills, setSkills] = useState<string[]>(["React", "TypeScript"]);
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
  const [authError, setAuthError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialName) {
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
    if (trimmed && !skills.includes(trimmed)) {
      if (skills.length >= 8) {
        setAuthError("You can select up to 8 key skills.");
        return;
      }
      setSkills([...skills, trimmed]);
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
      await api.put("/user/profile", {
        name: fullName.trim() || initialName || session?.user?.name,
        title: title.trim() || undefined,
        bio: bio.trim() || undefined,
        location: profileLocation ? `${profileLocation.city}, ${profileLocation.country}` : undefined,
        skills: formattedSkills.length > 0 ? formattedSkills : undefined,
        socialLinks: formattedSocialLinks.length > 0 ? formattedSocialLinks : undefined,
        contactNumbers: contactNumbers,
      });

      // 2. Mark onboarding completed in database
      await api.post("/user/profile/complete-onboarding");

      // 3. Update local session token so middleware allows /home
      if (update) {
        await update({
          onboardingCompleted: true,
          user: {
            onboardingCompleted: true,
          },
        });
      }

      // 4. Directly navigate to /home dashboard
      window.location.href = "/home";
    } catch (error: any) {
      console.error("Failed to complete onboarding:", error);
      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setAuthError(
          "Your session has expired. Redirecting to sign in...",
        );
        setTimeout(() => {
          router.push("/sign-in?callbackUrl=/onboarding");
        }, 1500);
        return;
      }
      setAuthError(
        error.response?.data?.message ||
          "Failed to save profile. Please check your connection and try again.",
      );
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
      {/* Left Column: Character Stage */}
      <div className="w-full md:w-[50%] lg:w-[54%] bg-[#ECECEE] min-h-[440px] md:min-h-screen flex flex-col justify-between pt-20 sm:pt-24 px-6 sm:px-10 lg:px-12 pb-0 relative overflow-hidden">
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
      <div className="w-full md:w-[50%] lg:w-[46%] min-h-[calc(100vh-440px)] md:min-h-screen bg-white flex flex-col justify-center items-center pt-24 pb-12 px-6 sm:px-12 lg:px-16 xl:px-20 text-neutral-900 overflow-y-auto">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <div className="space-y-7">
                {/* Minimal Step Indicator */}
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  <span>Profile Setup • Step 0{currentStep} / 0{totalSteps}</span>
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
                    className="min-h-[260px] flex flex-col justify-center space-y-5"
                  >
                    {/* STEP 1: Handle & Professional Title */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-1.5">
                            Profile Details & Headline
                          </h1>
                          <p className="text-sm text-neutral-500 font-medium">
                            Confirm your name and introduce your professional background.
                          </p>
                        </div>

                        <div className="space-y-3">
                          {/* Full Name from Sign Up */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">
                                Full Name
                              </label>
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                Required
                              </span>
                            </div>
                            <div className="relative flex items-center">
                              <User className="absolute left-3.5 w-4 h-4 text-neutral-400" />
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
                                className={`w-full h-12 pl-10 pr-4 rounded-xl bg-neutral-50 border ${
                                  fieldErrors.fullName ? "border-rose-400 bg-rose-50/20" : "border-neutral-200"
                                } text-neutral-900 text-base font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 focus:bg-white transition-all`}
                              />
                            </div>
                            {fieldErrors.fullName && (
                              <p className="text-xs font-semibold text-rose-500 pl-1">
                                {fieldErrors.fullName}
                              </p>
                            )}
                          </div>

                          {/* Username handle (commented out for now) */}
                          {/*
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">
                                Username Handle
                              </label>
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                Required
                              </span>
                            </div>
                            <div className="relative flex items-center">
                              <span className="absolute left-4 text-neutral-400 font-bold text-base select-none">
                                @
                              </span>
                              <input
                                type="text"
                                placeholder="username"
                                value={username}
                                onChange={(e) => handleUsernameChange(e.target.value)}
                                className="w-full h-12 pl-9 pr-4 rounded-xl bg-neutral-50 border border-neutral-200"
                              />
                            </div>
                          </div>
                          */}

                          {/* Professional Title */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">
                                Professional Title
                              </label>
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
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
                              className={`w-full h-12 px-4 rounded-xl bg-neutral-50 border ${
                                fieldErrors.title ? "border-rose-400 bg-rose-50/20" : "border-neutral-200"
                              } text-neutral-900 text-base font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 focus:bg-white transition-all`}
                            />
                            {fieldErrors.title && (
                              <p className="text-xs font-semibold text-rose-500 pl-1">
                                {fieldErrors.title}
                              </p>
                            )}
                          </div>

                          {/* Bio / About Me */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">
                                Bio / About Me
                              </label>
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
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
                              className={`w-full p-3 rounded-xl bg-neutral-50 border ${
                                fieldErrors.bio ? "border-rose-400 bg-rose-50/20" : "border-neutral-200"
                              } text-neutral-900 text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 focus:bg-white transition-all resize-none`}
                            />
                            <div className="flex items-center justify-between pl-1">
                              {fieldErrors.bio ? (
                                <p className="text-xs font-semibold text-rose-500">
                                  {fieldErrors.bio}
                                </p>
                              ) : (
                                <p className="text-[11px] text-neutral-400">
                                  Short summary shown on your public profile
                                </p>
                              )}
                              <span className="text-[11px] text-neutral-400 font-medium">
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
                          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-1.5">
                            Your job preferences
                          </h1>
                          <p className="text-sm text-neutral-500 font-medium">
                            We match you with opportunities based on these.
                          </p>
                        </div>

                        <div className="space-y-3.5">
                          {/* Preferred Role Name */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">
                                Preferred Role
                              </label>
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
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
                              className={`w-full h-12 px-4 rounded-xl bg-neutral-50 border ${
                                fieldErrors.preferredRole ? "border-rose-400 bg-rose-50/20" : "border-neutral-200"
                              } text-neutral-900 text-base font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 focus:bg-white transition-all`}
                            />
                            {fieldErrors.preferredRole && (
                              <p className="text-xs font-semibold text-rose-500 pl-1">
                                {fieldErrors.preferredRole}
                              </p>
                            )}
                          </div>

                          {/* Experience Level */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">
                                Seniority Level
                              </label>
                              <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
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
                                  className={`h-10 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                                    roleLevel === lvl
                                      ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                                      : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300"
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
                              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">
                                Work Style
                              </label>
                              <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
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
                                  className={`h-10 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                                    workType === type
                                      ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                                      : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300"
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
                          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-1.5">
                            Key skills & location
                          </h1>
                          <p className="text-sm text-neutral-500 font-medium">
                            Highlight your strengths and location for recruiters.
                          </p>
                        </div>

                        <div className="space-y-3.5">
                          {/* Active Selected Skills */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">
                                Selected Skills ({skills.length}/8)
                              </label>
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                Min 1 Required
                              </span>
                            </div>
                            <div
                              className={`flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl bg-neutral-50 border ${
                                fieldErrors.skills ? "border-rose-400 bg-rose-50/20" : "border-neutral-200"
                              }`}
                            >
                              {skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 text-white text-xs font-bold"
                                >
                                  {skill}
                                  <button
                                    type="button"
                                    onClick={() => removeSkill(skill)}
                                    className="hover:text-rose-300 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                              {skills.length === 0 && (
                                <span className="text-xs text-neutral-400 py-1">
                                  Click tags below or type to add skills
                                </span>
                              )}
                            </div>
                            {fieldErrors.skills && (
                              <p className="text-xs font-semibold text-rose-500 pl-1">
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
                                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
                                  >
                                    + {s}
                                  </button>
                                ))}
                            </div>
                          </div>

                          {/* Location Picker (Reused from candidate profile page) */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">
                                Location
                              </label>
                              <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                                Optional
                              </span>
                            </div>
                            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
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
                          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-1.5">
                            Links & Resume
                          </h1>
                          <p className="text-sm text-neutral-500 font-medium">
                            Add your portfolio, GitHub, or resume (optional).
                          </p>
                        </div>

                        <div className="space-y-3.5">
                          {/* Phone / Contact Number */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">
                                Contact Phone Number
                              </label>
                              <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                                Optional
                              </span>
                            </div>
                            <div className="relative flex items-center">
                              <Phone className="absolute left-3.5 w-4 h-4 text-neutral-400" />
                              <input
                                type="tel"
                                placeholder="+977 98XXXXXXXX"
                                value={contactNumber}
                                onChange={(e) => {
                                  setContactNumber(e.target.value);
                                  clearError();
                                }}
                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 focus:bg-white transition-all"
                              />
                            </div>
                          </div>

                          {/* LinkedIn URL */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">
                                LinkedIn Profile
                              </label>
                              <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
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
                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 focus:bg-white transition-all"
                              />
                            </div>
                          </div>

                          {/* GitHub URL */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">
                                GitHub Profile
                              </label>
                              <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
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
                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 focus:bg-white transition-all"
                              />
                            </div>
                          </div>

                          {/* Portfolio / Website URL */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">
                                Portfolio / Website
                              </label>
                              <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                                Optional
                              </span>
                            </div>
                            <div className="relative flex items-center">
                              <Globe className="absolute left-3.5 w-4 h-4 text-neutral-400" />
                              <input
                                type="url"
                                placeholder="https://yourportfolio.com"
                                value={portfolioUrl}
                                onChange={(e) => {
                                  setPortfolioUrl(e.target.value);
                                  clearError();
                                }}
                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 focus:bg-white transition-all"
                              />
                            </div>
                          </div>

                          {/* Resume Upload */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">
                                Upload Resume / CV
                              </label>
                              <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
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
                                className="w-full h-20 rounded-xl border-2 border-dashed border-neutral-200 hover:border-neutral-400 bg-neutral-50 hover:bg-neutral-100/70 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group"
                              >
                                <UploadCloud className="w-5 h-5 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
                                <span className="text-xs font-bold text-neutral-700">
                                  Click to upload PDF or DOCX
                                </span>
                                <span className="text-[10px] text-neutral-400">
                                  Max 5MB file size
                                </span>
                              </button>
                            ) : (
                              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-neutral-900 truncate">
                                      {resumeFile.name}
                                    </p>
                                    <p className="text-[10px] text-neutral-400">
                                      {resumeFile.size} • Ready
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setResumeFile(null)}
                                  className="text-neutral-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors cursor-pointer"
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
                <div className="w-14 h-14 bg-neutral-100 text-neutral-900 rounded-full flex items-center justify-center mx-auto border border-neutral-200">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight mb-1">
                    Profile Ready!
                  </h2>
                  <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                    Welcome to JobHub, <span className="font-bold text-neutral-900">{fullName || initialName || "Candidate"}</span>. Your candidate profile is set up to receive matched opportunities.
                  </p>
                </div>

                <div className="pt-3 space-y-2.5">
                  <Link href="/candidate-profile" className="block w-full">
                    <button
                      type="button"
                      className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <User className="w-4 h-4" />
                      <span>View Full Profile</span>
                    </button>
                  </Link>

                  <Link href="/home" className="block w-full">
                    <button
                      type="button"
                      className="w-full h-11 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full font-bold text-xs sm:text-sm transition-colors cursor-pointer"
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
        <div className="min-h-screen w-full bg-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-800" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
