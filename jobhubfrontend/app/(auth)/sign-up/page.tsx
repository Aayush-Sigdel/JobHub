"use client";

import React, { useState } from "react";
import Link from "next/link";
import JobHubLogo from "@/components/brand/JobHubLogo";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";

import { RegisterFormInput, registerSchema } from "@/lib/validation/auth";
import {
  AuthCharacters,
  AuthFieldType,
} from "@/components/auth/auth-characters";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);


export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<AuthFieldType>("none");
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
  const [isHoveringGoogle, setIsHoveringGoogle] = useState(false);
  const [authError, setAuthError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isSubmitted, touchedFields },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      employer: false,
    },
  });

  const nameVal = watch("name") || "";
  const emailVal = watch("email") || "";
  const passwordVal = watch("password") || "";

  // Real-time password constraint checks
  const hasLength = passwordVal.length >= 8;
  const hasUpper = /[A-Z]/.test(passwordVal);
  const hasLower = /[a-z]/.test(passwordVal);
  const hasUpperLower = hasUpper && hasLower;
  const hasNumber = /[0-9]/.test(passwordVal);
  const hasSpecial = /[@#$%^&+=!._\-\*]/.test(passwordVal);

  const clearAuthError = () => {
    if (authError) setAuthError("");
  };

  const onSubmit = async (data: RegisterFormInput) => {
    setAuthError("");
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          employer: data.employer || false,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setAuthError(
          err.message || "Failed to create account. Email may already exist.",
        );
        return;
      }

      router.push(
        `/verification?email=${encodeURIComponent(data.email)}&name=${encodeURIComponent(data.name)}`,
      );
    } catch (error) {
      setAuthError("Failed to connect to authentication server.");
    }
  };

  const handleGoogleSignUp = () => {
    signIn("google", { callbackUrl: "/home" });
  };

  const getActiveErrorMessage = () => {
    if (authError) return authError;
    if (focusedField === "name" && touchedFields.name && errors.name)
      return errors.name.message || "";
    if (focusedField === "email" && touchedFields.email && errors.email)
      return errors.email.message || "";
    if (
      focusedField === "password" &&
      touchedFields.password &&
      errors.password
    )
      return errors.password.message || "";
    if (isSubmitted) {
      return (
        errors.name?.message ||
        errors.email?.message ||
        errors.password?.message ||
        ""
      );
    }
    return "";
  };

  const errorMessage = getActiveErrorMessage();

  // Explicit Register Handlers so React Hook Form listeners are NEVER overwritten
  const nameReg = register("name");
  const emailReg = register("email");
  const passwordReg = register("password");

  return (
    <main className="min-h-dvh w-full flex flex-col md:flex-row bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Left Column: Character Stage with Comic Bubble */}
      <div className="w-full md:w-[52%] lg:w-[55%] xl:w-[58%] bg-muted border-b border-border md:border-b-0 md:border-r min-h-[480px] md:min-h-dvh flex flex-col justify-between pt-20 sm:pt-24 px-6 sm:px-10 lg:px-12 pb-0 relative overflow-hidden">
        {/* Grounded Interactive Characters + Speech Bubble */}
        <div className="relative w-full flex-1 flex flex-col justify-end items-center pb-0">
          <AuthCharacters
            focusedField={focusedField}
            showPassword={showPassword}
            isSubmitting={isSubmitting}
            isHoveringSubmit={isHoveringSubmit}
            isHoveringGoogle={isHoveringGoogle}
            nameValue={nameVal}
            emailValue={emailVal}
            passwordValue={passwordVal}
            errorMessage={errorMessage}
            pageType="signup"
            className="w-full max-w-[580px] lg:max-w-[680px] xl:max-w-[760px]"
          />
        </div>
      </div>

      {/* Right Column: Full-height clean form page */}
      <div className="w-full md:w-[48%] lg:w-[45%] xl:w-[42%] min-h-[calc(100dvh-480px)] md:min-h-dvh bg-card flex flex-col justify-center items-center pt-24 pb-12 px-6 sm:px-12 lg:px-16 xl:px-20 text-foreground overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Brand Sparkle Logo */}
          <div className="flex justify-center mb-5">
            <JobHubLogo markOnly markClassName="size-11" />
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl lg:text-4xl font-semibold tracking-tight text-foreground mb-2">
              Create an account
            </h1>
            <p className="text-base text-muted-foreground font-medium">
              Join JobHub to {watch("employer") ? "hire top talent" : "find your dream job"}
            </p>
          </div>
          
          {/* Account Type Toggle */}
          <div className="flex bg-muted p-1 rounded-xl mb-6 font-semibold text-sm">
            <button
              type="button"
              onClick={() => setValue("employer", false)}
              className={`flex-1 py-2.5 rounded-lg transition-all ${!watch("employer") ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={() => setValue("employer", true)}
              className={`flex-1 py-2.5 rounded-lg transition-all ${watch("employer") ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Employer
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground "
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                name={nameReg.name}
                ref={nameReg.ref}
                onChange={(e) => {
                  nameReg.onChange(e);
                  clearAuthError();
                }}
                onBlur={(e) => {
                  nameReg.onBlur(e);
                  setFocusedField("none");
                }}
                onFocus={() => {
                  setFocusedField("name");
                  clearAuthError();
                }}
                placeholder="Jane Doe"
                className={`w-full h-12 px-4 rounded-xl bg-background border ${
                  errors.name && (touchedFields.name || isSubmitted)
                    ? "border-destructive bg-destructive/5"
                    : "border-border"
                } text-foreground text-base font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-3 focus:ring-ring/30 focus:border-foreground/40 focus:bg-card transition-all`}
              />
              {errors.name && (touchedFields.name || isSubmitted) && (
                <p className="text-xs font-semibold text-destructive mt-1 pl-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground "
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                name={emailReg.name}
                ref={emailReg.ref}
                onChange={(e) => {
                  emailReg.onChange(e);
                  clearAuthError();
                }}
                onBlur={(e) => {
                  emailReg.onBlur(e);
                  setFocusedField("none");
                }}
                onFocus={() => {
                  setFocusedField("email");
                  clearAuthError();
                }}
                placeholder="name@company.com"
                className={`w-full h-12 px-4 rounded-xl bg-background border ${
                  errors.email && (touchedFields.email || isSubmitted)
                    ? "border-destructive bg-destructive/5"
                    : "border-border"
                } text-foreground text-base font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-3 focus:ring-ring/30 focus:border-foreground/40 focus:bg-card transition-all`}
              />
              {errors.email && (touchedFields.email || isSubmitted) && (
                <p className="text-xs font-semibold text-destructive mt-1 pl-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground "
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  name={passwordReg.name}
                  ref={passwordReg.ref}
                  onChange={(e) => {
                    passwordReg.onChange(e);
                    clearAuthError();
                  }}
                  onBlur={(e) => {
                    passwordReg.onBlur(e);
                    setFocusedField("none");
                  }}
                  onFocus={() => {
                    setFocusedField("password");
                    clearAuthError();
                  }}
                  placeholder="••••••••"
                  className={`w-full h-12 px-4 pr-12 rounded-xl bg-background border ${
                    errors.password && (touchedFields.password || isSubmitted)
                      ? "border-destructive bg-destructive/5"
                      : "border-border"
                  } text-foreground text-base font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-3 focus:ring-ring/30 focus:border-foreground/40 focus:bg-card transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1.5 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Minimal, Simplified Password Requirements */}
              <div className="flex items-center justify-between text-[11.5px] font-medium pt-1.5 px-1 select-none">
                <span
                  className={`flex items-center gap-1 transition-colors duration-150 ${
                    hasLength
                      ? "text-success font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  <span>{hasLength ? "✓" : "•"}</span>
                  <span>8+ chars</span>
                </span>

                <span
                  className={`flex items-center gap-1 transition-colors duration-150 ${
                    hasUpperLower
                      ? "text-success font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  <span>{hasUpperLower ? "✓" : "•"}</span>
                  <span>Upper & lower</span>
                </span>

                <span
                  className={`flex items-center gap-1 transition-colors duration-150 ${
                    hasNumber
                      ? "text-success font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  <span>{hasNumber ? "✓" : "•"}</span>
                  <span>0-9</span>
                </span>

                <span
                  className={`flex items-center gap-1 transition-colors duration-150 ${
                    hasSpecial
                      ? "text-success font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  <span>{hasSpecial ? "✓" : "•"}</span>
                  <span>Special symbol</span>
                </span>
              </div>

              {errors.password && (touchedFields.password || isSubmitted) && (
                <p className="text-xs font-semibold text-destructive mt-1 pl-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Form-level Auth error message */}
            {authError && (
              <p className="text-xs font-semibold text-destructive mt-1.5 pl-1">
                {authError}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              onMouseEnter={() => setIsHoveringSubmit(true)}
              onMouseLeave={() => setIsHoveringSubmit(false)}
              className="w-full h-12 sm:h-12 mt-3 bg-primary hover:bg-primary/85 active:scale-[0.99] text-primary-foreground rounded-xl font-medium text-base sm:text-base transition-all duration-150 flex items-center justify-center gap-2.5 shadow-none hover:shadow-none disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Social Sign Up Button */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              onMouseEnter={() => setIsHoveringGoogle(true)}
              onMouseLeave={() => setIsHoveringGoogle(false)}
              className="w-full h-12 sm:h-12 bg-card hover:bg-muted active:scale-[0.99] text-foreground rounded-xl font-medium text-base border border-border transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer shadow-sm"
            >
              <GoogleIcon />
              <span>Sign up with Google</span>
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center mt-7 text-sm text-muted-foreground font-medium">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-foreground hover:underline transition-colors ml-1"
            >
              Log In
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
